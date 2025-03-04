import os
import google.generativeai as genai
from flask import Flask, request, jsonify, render_template
from dotenv import load_dotenv
import json
import time
import uuid
from werkzeug.utils import secure_filename
from google.api_core.exceptions import InternalServerError
import mimetypes
import random
import re
# import html2text # Xóa import

load_dotenv(override=True)

app = Flask(__name__, static_folder='static', static_url_path='/static')

genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

model_name = os.environ.get("MODEL_NAME")
temperature = float(os.environ.get("TEMPERATURE"))
top_p = float(os.environ.get("TOP_P"))
top_k = int(os.environ.get("TOP_K"))
max_output_tokens = int(os.environ.get("MAX_OUTPUT_TOKENS"))
system_instruction = os.environ.get("SYSTEM_INSTRUCTION")

generation_config = {
    "temperature": temperature,
    "top_p": top_p,
    "top_k": top_k,
    "max_output_tokens": max_output_tokens,
}

model = genai.GenerativeModel(
    model_name=model_name,
    generation_config=generation_config,
)

# Đường dẫn đến thư mục data
data_folder = os.path.join(os.path.dirname(__file__), 'data')
# Đường dẫn đến thư mục chats
chats_folder = os.path.join(data_folder, 'chats')

# Thư mục lưu trữ file upload
UPLOAD_FOLDER = os.path.join(app.static_folder, 'uploads')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'py', 'css', 'hmtl', 'cpp', 'cp','js', 'json', 'md', 'docx', 'cvs'}

def allowed_file(filename):
    return '.' in filename and \
        filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def load_safety_settings():
    filepath = os.path.join(data_folder, 'settings.json')
    try:
        with open(filepath, 'r') as f:
            try:
                settings = json.load(f)
            except json.JSONDecodeError:
                settings = {}
            return settings.get('safety_settings', {})
    except FileNotFoundError:
        default_settings = {
            'safety_settings': {
                "HARM_CATEGORY_HATE_SPEECH": "HARM_BLOCK_THRESHOLD_UNSPECIFIED",
                "HARM_CATEGORY_DANGEROUS_CONTENT": "HARM_BLOCK_THRESHOLD_UNSPECIFIED",
                "HARM_CATEGORY_HARASSMENT": "HARM_BLOCK_THRESHOLD_UNSPECIFIED",
                "HARM_CATEGORY_SEXUALLY_EXPLICIT": "HARM_BLOCK_THRESHOLD_UNSPECIFIED"
            }
        }
        with open(filepath, 'w') as f:
            json.dump(default_settings, f, indent=4)
        return default_settings['safety_settings']

def get_random_prompts(num_prompts=3):
    filepath = os.path.join(data_folder, 'ex.json')
    try:
        with open(filepath, 'r', encoding='utf-8') as f: # Thêm encoding='utf-8'
            prompts = json.load(f)
    except FileNotFoundError:
        return []

    # Xáo trộn danh sách prompts
    random.shuffle(prompts)
    return prompts[:num_prompts]



@app.route('/get_safety_settings')
def get_safety_settings():
    safety_settings = load_safety_settings()
    return jsonify(safety_settings)

@app.route('/save_safety_settings', methods=['POST'])
def save_safety_settings():
    safety_settings = request.json
    filepath = os.path.join(data_folder, 'settings.json')

    os.makedirs(data_folder, exist_ok=True)

    try:
        with open(filepath, 'r+') as f:
            try:
                settings = json.load(f)
            except json.JSONDecodeError:
                settings = {}

            settings['safety_settings'] = safety_settings
            f.seek(0)
            json.dump(settings, f, indent=4)
            f.truncate()
    except FileNotFoundError:
        with open(filepath, 'w') as f:
            json.dump({'safety_settings': safety_settings}, f, indent=4)

    return jsonify({'message': 'Safety settings saved successfully!'})

def get_chat_history(chat_id):
    filepath = os.path.join(chats_folder, f"{chat_id}.json")
    try:
        with open(filepath, 'r', encoding='utf-8') as f:  # Thêm encoding='utf-8'
            chat_data = json.load(f)
            if isinstance(chat_data, dict) and 'history' in chat_data:
                return chat_data['history']
            else:
                print(f"Invalid chat history format in {filepath}")
                return None
    except FileNotFoundError:
        print(f"File not found: {filepath}")
        return None
    except json.JSONDecodeError:
        print(f"Error decoding JSON from {filepath}")
        return None

def save_chat_history(chat_id, history):
    filepath = os.path.join(chats_folder, f"{chat_id}.json")
    os.makedirs(chats_folder, exist_ok=True)

    formatted_history = []
    for message in history:
        formatted_message = {
            "role": message["role"],
            "parts": []
        }
        for part in message["parts"]:
            # Loại bỏ các thẻ không mong muốn
            if isinstance(part, dict) and "text" in part:
                cleaned_text = re.sub(r'<button.*?</button>', '', part["text"])
                cleaned_text = re.sub(r'<div class="message-options.*?</div>', '', cleaned_text)
                formatted_message["parts"].append({"text": cleaned_text})

            # Xử lý trường hợp 'code', chuyển thành 'text'
            elif isinstance(part, dict) and "code" in part:
                formatted_message["parts"].append({"text": part["code"]}) # Chuyển "code" thành "text"

        formatted_history.append(formatted_message)

    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump({"history": formatted_history}, f, indent=4, ensure_ascii=False)

def process_single_file_with_gemini(file_info, user_prompt):
    """Xử lý một file với prompt từ người dùng."""
    response_text = ""
    if file_info["type"] == "text":
        try:
            # Tạo prompt cho file text
            prompt = f"{user_prompt}\n\nNội dung file {file_info['filename']}:\n{file_info['content']}"
            # Gửi prompt đến model
            response = model.generate_content(prompt)
            response_text = response.text
        except Exception as e:
            print(f"Lỗi khi xử lý file text '{file_info['filename']}': {e}")
            response_text = f"Lỗi: Không thể xử lý file text này. ({e})"

    elif file_info["type"] == "image":
        try:
            # Tạo Part từ file ảnh
            file_path = file_info["file_path"]
            mime_type = file_info["mime_type"]

            with open(file_path, "rb") as image_file:
                image_data = image_file.read()

            # Thay đổi cách tạo image_part
            image_part = {
                "mime_type": mime_type,
                "data": image_data
            }

            # Tạo prompt yêu cầu mô tả ảnh
            prompt_parts = [user_prompt, image_part]

            # Gửi prompt đến model
            response = model.generate_content(prompt_parts)
            response_text = response.text
        except Exception as e:
            print(f"Lỗi khi xử lý file ảnh '{file_info['filename']}': {e}")
            response_text = f"Lỗi: Không thể xử lý file ảnh này. ({e})"

    return response_text

system_instruction = os.environ.get("SYSTEM_INSTRUCTION")

@app.route("/chat", methods=["POST"])
def chat():
    global system_instruction
    message = request.json.get("message")
    chat_id = request.json.get("chat_id")
    uploaded_filenames = request.json.get("uploaded_filenames", [])

    if not chat_id:
        chat_id = str(uuid.uuid4())
        history = []
    else:
        history = get_chat_history(chat_id)

    safety_settings = load_safety_settings()
    safety_settings_list = [
        {
            "category": category,
            "threshold": threshold,
        }
        for category, threshold in safety_settings.items()
    ]

    # Xử lý file đã upload
    file_responses = []
    if uploaded_filenames:
        for filename in uploaded_filenames:
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            mime_type = mimetypes.guess_type(file_path)[0]

            if mime_type and mime_type.startswith('text/'):
                with open(file_path, 'r', encoding='utf-8') as f:
                    try:
                        file_content = f.read()
                        file_info = {
                            "type": "text",
                            "content": file_content,
                            "filename": filename,
                        }
                        file_response = process_single_file_with_gemini(file_info, message)
                        file_responses.append(
                            {
                                "filename": filename,
                                "response": file_response,
                            }
                        )
                    except UnicodeDecodeError:
                        print(f"Lỗi: Không thể decode file '{filename}' với UTF-8.")
                        file_responses.append(
                            {
                                "filename": filename,
                                "response": f"Lỗi: Không thể decode file text '{filename}'.",
                            }
                        )

            elif mime_type and mime_type.startswith('image/'):
                file_info = {
                    "type": "image",
                    "file_path": file_path,
                    "filename": filename,
                    "mime_type": mime_type
                }
                file_response = process_single_file_with_gemini(file_info, message)
                file_responses.append(
                    {
                        "filename": filename,
                        "response": file_response,
                    }
                )

    max_retries = 3
    retry_delay = 5

    messages = [
        {
            "role": "user",
            "parts": [{"text": message}]
        }
    ]

    for attempt in range(max_retries):
        try:
            response = model.generate_content( 
                history + messages,
                safety_settings=safety_settings_list
            )
            # Kiểm tra kiểu dữ liệu của response
            if hasattr(response, 'text'):
                response_text = response.text.strip()
            else:
                response_text = ""
                for part in response.parts:
                    response_text += part.text.strip() + " "
                response_text = response_text.strip()

            if response_text.startswith(">"):
                response_text = response_text[1:].strip()


            # Cập nhật và lưu lịch sử chat sau mỗi lần gửi tin nhắn
            history.append(messages[0])
            history.append(
                {
                    "role": "model",
                    "parts": [{"text": response_text}]
                }
            )
            save_chat_history(chat_id, history)

            return jsonify({
                "response": response_text,
                "chat_id": chat_id,
                "file_responses": file_responses
            })


        except InternalServerError as e:
            print(f"Attempt {attempt + 1} failed with error: {e}")
            if attempt < max_retries - 1:
                print(f"Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
            else:
                print("Max retries reached.")
                return jsonify({"error": "Internal Server Error", "chat_id": chat_id}), 500
        except Exception as e:
            print(f"An unexpected error occurred: {e}")
            return jsonify({"error": "An unexpected error occurred.", "chat_id": chat_id}), 500

    return jsonify({"error": "Failed to generate content after multiple retries", "chat_id": chat_id}), 500

@app.route("/get_chats", methods=["GET"])
def get_chats():
    chat_files = [f for f in os.listdir(chats_folder) if f.endswith('.json')]
    chats = []
    for file in chat_files:
        chat_id = file[:-5]
        history = get_chat_history(chat_id)
        if history:
            last_message_content = history[-1]

            last_message_parts = []
            for part in last_message_content["parts"]:
                if "text" in part: 
                    last_message_parts.append(part["text"])
     
            last_message = "".join(last_message_parts)
            chats.append({"chat_id": chat_id, "last_message": last_message})
    return jsonify(chats)

@app.route("/get_chat_history", methods=["GET"])
def get_chat_history_route():
    chat_id = request.args.get("chat_id")
    if not chat_id:
        return jsonify({"error": "Chat ID is required"}), 400

    history = get_chat_history(chat_id)
    if history is None:
        return jsonify({"error": "Chat not found or invalid format"}), 404

    return jsonify(history)

@app.route("/delete_chat", methods=["POST"])
def delete_chat():
    chat_id = request.json.get("chat_id")
    filepath = os.path.join(chats_folder, f"{chat_id}.json")
    if os.path.exists(filepath):
        os.remove(filepath)
        return jsonify({"message": "Chat deleted successfully"})
    else:
        return jsonify({"error": "Chat not found"}), 404

@app.route("/delete_all_chats", methods=["POST"])
def delete_all_chats():
    for filename in os.listdir(chats_folder):
        if filename.endswith(".json"):
            file_path = os.path.join(chats_folder, filename)
            os.remove(file_path)
    return jsonify({"message": "All chats deleted successfully"})

@app.route("/upload", methods=["POST"])
def upload_file():
    if 'files' not in request.files:
        return jsonify({"error": "No file part"}), 400

    files = request.files.getlist('files')
    filenames = []

    for file in files:
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)
            filenames.append(filename)
        else:
            return jsonify({"error": "File type not allowed"}), 400

    return jsonify({
        "message": "Files uploaded successfully",
        "filenames": filenames,
    })

@app.route('/get_system_instruction')
def get_system_instruction():
    return jsonify({'system_instruction': system_instruction})

@app.route('/save_system_instruction', methods=['POST'])
def save_system_instruction_route():
    global system_instruction
    new_instruction = request.json.get('system_instruction')

    # Cập nhật biến môi trường trong bộ nhớ
    os.environ["SYSTEM_INSTRUCTION"] = new_instruction
    system_instruction = new_instruction
    # Cập nhật file .env
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    if os.path.exists(env_path):
        with open(env_path, "r", encoding='utf-8') as file: 
            lines = file.readlines()

        with open(env_path, "w", encoding='utf-8') as file: 
            for line in lines:
                if line.startswith("SYSTEM_INSTRUCTION"):
                    file.write(f"SYSTEM_INSTRUCTION=\"{new_instruction}\"\n")
                else:
                    file.write(line)

        return jsonify({'message': 'System instruction saved successfully!'})
    else:
        return jsonify({'error': '.env file not found'}), 404

@app.route('/get_random_prompts')
def get_random_prompts_route():
    prompts = get_random_prompts()
    return jsonify(prompts)


@app.route("/")
def index():
    return render_template('index.html')

if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True)