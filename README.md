# Chat Bot UI ᓚᘏᗢ

![Image](https://github.com/user-attachments/assets/544a539e-6e2e-435d-b275-472594d6f562)



## Introduction
<!-- Vietnamese -->
<details>
  <summary>🇻🇳 Tiếng Việt</summary>

## Giới thiệu

**Chat Bot GUI** là một ứng dụng giao diện người dùng (UI) cho phép tương tác với mô hình ngôn ngữ Gemini của Google (Gemini 2.0 Flash) thông qua một giao diện trò chuyện thân thiện.  Ứng dụng hỗ trợ tải lên và xử lý nhiều loại file (text, ảnh), tùy chỉnh cài đặt an toàn, quản lý lịch sử trò chuyện, và thay đổi hướng dẫn hệ thống (system instruction).

## Tính năng

*   **Giao diện trò chuyện:** Giao diện trực quan, dễ sử dụng, hỗ trợ hiển thị tin nhắn của người dùng và phản hồi từ bot.
*   **Tải lên file:** Hỗ trợ tải lên nhiều file (text, ảnh) để cung cấp ngữ cảnh cho bot.
*   **Xử lý file:**
    *   **File text:** Đọc nội dung file text và gửi cho Gemini cùng với câu hỏi của người dùng.
    *   **File ảnh:** Gửi ảnh cho Gemini để mô tả hoặc phân tích.
*   **Tùy chỉnh cài đặt an toàn:** Điều chỉnh các ngưỡng chặn cho các loại nội dung nhạy cảm (ngôn từ thù hận, nội dung nguy hiểm, quấy rối, nội dung khiêu dâm).
*   **Quản lý lịch sử trò chuyện:**
    *   Lưu lịch sử trò chuyện vào các file JSON riêng biệt.
    *   Tải lại lịch sử trò chuyện.
    *   Xóa từng cuộc trò chuyện hoặc tất cả cuộc trò chuyện.
*   **Hướng dẫn hệ thống (System Instruction):** Thay đổi hướng dẫn hệ thống để tùy chỉnh hành vi của bot.
*   **Prompt mẫu:** Cung cấp các prompt mẫu để bắt đầu cuộc trò chuyện.
*   **Hiển thị code:** Hiển thị code với cú pháp được tô sáng (syntax highlighting) và hỗ trợ copy code.
*   **Phản hồi đa phương tiện:** Hỗ trợ hiển thị văn bản và code từ mô hình.
*   **Thanh bên có thể thu gọn:** Ẩn/hiện thanh bên chứa lịch sử cuộc trò chuyện.
*   **Chỉ báo trạng thái nhập:** Hiện thị icon khi Rin đang nhập.

## Cài đặt

1.  **Yêu cầu:**
    *   Python 3.6 trở lên.
    *   Các thư viện Python: `google-generativeai`, `flask`, `python-dotenv`, `werkzeug`, `mimetypes`, `Pillow`.

2.  **Cài đặt (Sử dụng `run.bat` - Khuyến nghị):**

    *   Tải repository này về máy (Clone hoặc tải ZIP).
    *   Mở thư mục vừa tải về.
    *   Chạy file `run.bat`. File này sẽ tự động tạo môi trường ảo (virtual environment) `moitruongao`, cài đặt các thư viện cần thiết, và chạy ứng dụng.

3.  **Cài đặt (Thủ công):**
    Mở terminal (command prompt hoặc PowerShell trên Windows):

    ```bash
    # Clone repository (nếu chưa tải về)
    git clone https://github.com/Rin1809/Chat_AI_Interface/
    cd <ten_thu_muc>

    # Tạo môi trường ảo (tùy chọn nhưng rất khuyến khích)
    python -m venv moitruongao

    # Kích hoạt môi trường ảo
    # Trên Windows:
    moitruongao\Scripts\activate
    # Trên Linux/macOS:
    source moitruongao/bin/activate

    # Cài đặt thư viện
    pip install -r requirements.txt
    ```


4.  **Chạy ứng dụng:**

    ```bash
     # Đảm bảo môi trường ảo đã được kích hoạt (nếu bạn dùng)
     python Chat_Interface\app.py
    ```
5. **Cấu hình**
    * Tạo một file `.env` trong thư mục `Chat_Interface`.
    * Thêm các biến môi trường cần thiết vào file `.env` (xem file `.env` mẫu trong dự án).  Quan trọng nhất là `GEMINI_API_KEY`. Lấy key tại: [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey).

## Hướng dẫn sử dụng

1.  **Nhập tin nhắn:** Nhập câu hỏi hoặc yêu cầu của bạn vào ô nhập tin nhắn và nhấn nút "Send" (biểu tượng hình tròn) hoặc nhấn `Enter`.
2.  **Tải file:**
    *   Nhấn nút "Upload" (biểu tượng dấu cộng).
    *   Chọn một hoặc nhiều file.
    *   Nhấn "Open".
    *   Tên file sẽ hiển thị trong tin nhắn phản hồi của bot.
3.  **Tạo prompt mới:** Nhấn nút "New Prompt" để bắt đầu cuộc trò chuyện mới (xóa lịch sử trò chuyện hiện tại trên giao diện).
4.  **Cài đặt an toàn:**
    *   Nhấn nút "Safety Settings" để mở bảng cài đặt.
    *   Điều chỉnh các ngưỡng chặn cho từng loại nội dung.
    *   Nhấn "Save Settings".
5.  **Xóa tất cả cuộc trò chuyện:** Nhấn nút "Delete All Chats" trong sidebar.
6.  **Xem lịch sử trò chuyện:**
    *   Các cuộc trò chuyện trước đó được liệt kê trong sidebar.
    *   Nhấn vào một cuộc trò chuyện để tải lại lịch sử.
7. **Xóa cuộc trò chuyện:** Nhấn nút "Delete" (biểu tượng thùng rác) bên cạnh cuộc trò chuyện trong sidebar.
8. **Thay đổi System Instruction**
      * Nhấn vào icon tam giác để mở.
      * Thay đổi System Intruction trong khung.
      * Nhấn nút check (Lưu).
9. **Prompt Mẫu**: Chọn prompt có sẵn trong phần gợi ý.

</details>

<!-- English -->
<details>
  <summary>🇬🇧 English</summary>

## Introduction

The **Chat Bot GUI** is a user interface (UI) application that allows you to interact with Google's Gemini language model (Gemini 2.0 Flash) through a friendly chat interface. The application supports uploading and processing various file types (text, images), customizing safety settings, managing chat history, and changing the system instruction.

## Features

*   **Chat Interface:** Intuitive and easy-to-use interface, supporting display of user messages and bot responses.
*   **File Upload:** Supports uploading multiple files (text, images) to provide context to the bot.
*   **File Processing:**
    *   **Text Files:** Reads the content of text files and sends it to Gemini along with the user's question.
    *   **Image Files:** Sends images to Gemini for description or analysis.
*   **Customizable Safety Settings:** Adjust blocking thresholds for various types of sensitive content (hate speech, dangerous content, harassment, sexually explicit content).
*   **Chat History Management:**
    *   Saves chat history to separate JSON files.
    *   Loads chat history.
    *   Deletes individual chats or all chats.
*   **System Instruction:** Change the system instruction to customize the bot's behavior.
* **Example Prompts:**: Provide example prompts to get the chat started.
*   **Code Display:** Displays code with syntax highlighting and supports code copying.
*   **Multimedia Response:** Supports displaying text, and code from the model.
*  **Collapsible Sidebar**: Show/Hide chat history.
*   **Typing Indicator:** Displays icon while Rin is typing.

## Installation

1.  **Requirements:**
    *   Python 3.6 or higher.
    *   Python libraries: `google-generativeai`, `flask`, `python-dotenv`, `werkzeug`, `mimetypes`, `Pillow`.

2.  **Installation (Using `run.bat` - Recommended):**

    *   Download this repository (Clone or download ZIP).
    *   Open the downloaded folder.
    *   Run the `run.bat` file. This will automatically create a virtual environment (`moitruongao`), install the necessary libraries, and run the application.

3.  **Installation (Manual):**
    Open a terminal (command prompt or PowerShell on Windows):

    ```bash
    # Clone the repository (if not already downloaded)
    git clone https://github.com/Rin1809/Chat_AI_Interface/
    cd <repository_directory>

    # Create a virtual environment (optional but highly recommended)
    python -m venv moitruongao

    # Activate the virtual environment
    # On Windows:
    moitruongao\Scripts\activate
    # On Linux/macOS:
    source moitruongao/bin/activate

    # Install dependencies
    pip install -r requirements.txt
    ```

4.  **Run the Application:**

    ```bash
    # Make sure the virtual environment is activated (if you are using one)
    python Chat_Interface/app.py
    ```
5. **Configuration:**
    *   Create a `.env` file in the `Chat_Interface` directory.
    *   Add the necessary environment variables to the `.env` file (see the example `.env` file in the project). The most important one is `GEMINI_API_KEY`. Get a key at: [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey).

## Usage Instructions

1.  **Enter a message:** Type your question or request into the message input box and click the "Send" button (the circular icon) or press `Enter`.
2.  **Upload files:**
    *   Click the "Upload" button (the plus icon).
    *   Select one or more files.
    *   Click "Open".
    *   The filenames will be displayed in the bot's response message.
3.  **Create a new prompt:** Click the "New Prompt" button to start a new conversation (clears the current chat history on the interface).
4.  **Safety settings:**
    *   Click the "Safety Settings" button to open the settings panel.
    *   Adjust the blocking thresholds for each content type.
    *   Click "Save Settings".
5.  **Delete all chats:** Click the "Delete All Chats" button in the sidebar.
6.  **View chat history:**
    *   Previous chats are listed in the sidebar.
    *   Click on a chat to load its history.
7.  **Delete a chat:** Click the "Delete" button (trash can icon) next to the chat in the sidebar.
8. **Change System Instruction:**
      * Click the triangle icon to open.
      * Change System Intruction.
      * Click check button (Save).
9. **Example Prompts**: Click on an available example prompt.

</details>

<!-- Japanese -->
<details>
  <summary>🇯🇵 日本語</summary>

## 概要

**Chat Bot GUI** は、Google の Gemini (Gemini 2.0 Flash) 言語モデルとフレンドリーなチャットインターフェースを通じて対話できるユーザーインターフェース (UI) アプリケーションです。このアプリケーションは、さまざまなファイルタイプ (テキスト、画像) のアップロードと処理、安全設定のカスタマイズ、チャット履歴の管理、システム指示の変更をサポートしています。

## 機能

*   **チャットインターフェース:** ユーザーメッセージとボットの応答の表示をサポートする、直感的で使いやすいインターフェース。
*   **ファイルアップロード:** ボットにコンテキストを提供するために、複数のファイル (テキスト、画像) のアップロードをサポートします。
*   **ファイル処理:**
    *   **テキストファイル:** テキストファイルの内容を読み取り、ユーザーの質問とともに Gemini に送信します。
    *   **画像ファイル:** 説明または分析のために画像を Gemini に送信します。
*   **カスタマイズ可能な安全設定:** さまざまな種類の機密コンテンツ (ヘイトスピーチ、危険なコンテンツ、嫌がらせ、露骨な性的コンテンツ) のブロックしきい値を調整します。
*   **チャット履歴管理:**
    *   チャット履歴を個別の JSON ファイルに保存します。
    *   チャット履歴を読み込みます。
    *   個々のチャットまたはすべてのチャットを削除します。
*   **システム指示:** システム指示を変更して、ボットの動作をカスタマイズします。
* **プロンプト例:** チャットを開始するためのプロンプト例を提供します。
*   **コード表示:** 構文を強調表示してコードを表示し、コードのコピーをサポートします。
*   **メッセージへのフィードバック:** 再試行。
*  **折りたたみ可能なサイドバー**: チャット履歴を表示・非表示。
*   **入力インジケーター:** りんが入力中にアイコンを表示。

## インストール

1.  **要件:**
    *   Python 3.6 以上。
    *   Python ライブラリ: `google-generativeai`, `flask`, `python-dotenv`, `werkzeug`, `mimetypes`, `Pillow`.

2.  **インストール (推奨される `run.bat` の使用):**

    *   このリポジトリをダウンロードします (クローンまたは ZIP ダウンロード)。
    *   ダウンロードしたフォルダを開きます。
    *   `run.bat` ファイルを実行します。これにより、仮想環境 (`moitruongao`) が自動的に作成され、必要なライブラリがインストールされ、アプリケーションが実行されます。

3.  **インストール (手動):**
    ターミナル (Windows ではコマンドプロンプトまたは PowerShell) を開きます。

    ```bash
    # リポジトリをクローンします (まだダウンロードしていない場合)
    git clone https://github.com/Rin1809/Chat_AI_Interface/
    cd <repository_directory>

    # 仮想環境を作成します (オプションですが、強く推奨します)
    python -m venv moitruongao

    # 仮想環境をアクティブ化します
    # Windows の場合:
    moitruongao\Scripts\activate
    # Linux/macOS の場合:
    source moitruongao/bin/activate

    # 依存関係をインストール
    pip install -r requirements.txt
    ```


4.  **アプリケーションの実行:**

    ```bash
    # 仮想環境がアクティブ化されていることを確認してください (使用している場合)
    python Chat_Interface/app.py
    ```
5. **設定:**
  * `Chat_Interface` ディレクトリに `.env` ファイルを作成します。
  * 必要な環境変数を `.env` ファイルに追加します (プロジェクト内の `.env` ファイルの例を参照してください)。最も重要なのは `GEMINI_API_KEY` です。[makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey) でキーを取得してください。

## 使用方法

1.  **メッセージの入力:** メッセージ入力ボックスに質問またはリクエストを入力し、「送信」ボタン (円形のアイコン) をクリックするか、`Enter` キーを押します。
2.  **ファイルのアップロード:**
    *   「アップロード」ボタン (プラスアイコン) をクリックします。
    *   1つまたは複数のファイルを選択します。
    *   「開く」をクリックします。
    *   ファイル名はボットの応答メッセージに表示されます。
3.  **新しいプロンプトの作成:** 「新しいプロンプト」ボタンをクリックして、新しい会話を開始します (インターフェイス上の現在のチャット履歴をクリアします)。
4.  **安全設定:**
    *   「安全設定」ボタンをクリックして、設定パネルを開きます。
    *   各コンテンツタイプのブロックしきい値を調整します。
    *   「設定を保存」をクリックします。
5.  **すべてのチャットを削除:** サイドバーの「すべてのチャットを削除」ボタンをクリックします。
6.  **チャット履歴の表示:**
    *   以前のチャットはサイドバーに一覧表示されます。
    *   チャットをクリックして履歴を読み込みます。
7.  **チャットの削除:** サイドバーのチャットの横にある「削除」ボタン (ゴミ箱アイコン) をクリックします。
8.  **システム指示の変更:**
    * 三角形のアイコンをクリックして開きます。
    * システム指示を変更します。
    * チェック ボタン (保存) をクリックします。
9. **プロンプト例**: 使用可能なプロンプト例をクリックします。

</details>
