## 注册 App ID

首先，按照以下步骤注册 App ID：

如果您已经注册过带有推送通知 App ID，可以跳过该步骤。

1. 登录 [Member Center](https://developer.apple.com/account/)。
2. 点击 Certificates, Identifiers & Profiles。
3. 选择 Identifiers 下的 App IDs。
4. 点击右上方的加号按钮 (+)。
5. 填写 App ID 的基本信息。

![Create App ID](images/ios_cert_v2/create_app_id.png)

6. 选择创建 Explicit App ID，填入 app 的 bundle ID。注意，Explicit App ID 不能包含星号 (*)。

![Enter Explicit bundle ID](images/ios_cert_v2/enter_explicit_app_id.png)

7. 选择 App ID 需要开启的服务。此处要勾选 Push Notifications。

![Select push notification](images/ios_cert_v2/select_push_notification.png)

8. 点击 Continue。
9. 确认注册信息，然后点击 Register。
10. 点击 Done。

## 为已有的 App ID 开启推送通知

如果您希望为已有的 App ID 开启推送通知，可以通过以下步骤来完成：

1. 选择要开启推送通知的 App ID。
2. 勾选 Push Notifications 复选框。

![Edit push notification](images/ios_cert_v2/edit_push_notification.png)

3. 如果弹出警告对话框，点击 OK。
4. 点击 Done。

## 创建推送证书

每个 App ID 都需要单独的客户端 SSL 证书来和 APNs 通信。生成的证书是一个全局（universal）证书，允许你在应用连接测试环境和生产环境。

可以通过以下步骤来完成：

1. 点击 Certificates 下的 All。
2. 点击右上方的加号按钮 (+)。

![Create SSL certificate](images/ios_cert_v2/create_ssl_certificate.png)

3. 在 Production 下面，选择“Apple Push Notification service SSL (Sandbox & Production)”复选框，然后点击 Continue。

![Select push certificate](images/ios_cert_v2/select_production_with_push_certificate.png)

4. 选择之前创建的 App ID，注意 explicit App ID 需要和应用的 bundle ID 匹配。选择后点击 Continue。
5. 按照下个页面的步骤从 Mac 创建一个 certificate request，点击 Continue。
6. 点击 Choose File，在弹出的下拉框中选择 certificate request 文件（扩展名为 .certSigningRequest），然后点击 Continue。
7. 点击 Generate。

![Generate SSL certificate](images/ios_cert_v2/generate_ssl_certificate.png)

8. 点击 Download 下载生成的证书，并双击导入到 Keychain Access 中。
9. 点击 Done。

## 验证 App ID 的推送服务是否打开

1. 点击 Identifiers 下的 App IDs。
2. 选择与应用 bundle ID 匹配的 App ID。
3. 如果下图中红色方框中显示 Enabled，表示 App ID 的推送证书已配置好。

![Verify push notification](images/ios_cert_v2/verify_push_notification.png)

## 导出证书

1. 打开 Keychain Access，找到要导出的证书。证书名有前缀 Apple Push Services。
2. 右键点击证书，选择导出（Export）。选择保存格式为 .p12。此时会提示您输入密码来保护导出的证书，此时请不要输入密码，让两个输入框为空，点击 OK。接着又会弹出一个对话框，要求您输入 OS X 账户的密码来允许从 Keychain Access 中导出，请填写密码并点击允许（Allow）。

## 上传证书

1. 进入 LeanCloud 应用控制台。
2. 点击消息，选择推送下面的设置。
3. 根据您的证书类别进行上传。这里请注意区分证书的类别，测试环境证书和生产环境证书请勿混淆。

![Push certificate configure](images/ios_cert_v2/push_certificate_config.png)
