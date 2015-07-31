# 第三方平台账号登录组件（SNS）开发指南


AVOSCloudSNS 是一个非常轻量的模块, 可以用最少一行代码就可以实现社交平台用户登录.


## iOS SNS 组件

我们已经把 SNS 组件开源了，放在 Github 的 [leancloud-social-ios](https://github.com/leancloud/leancloud-social-ios) 项目上。该项目上的 LeanCloudSocialDemo 目录下也有个相应的 Demo。也可以参考 [LeanChat](https://github.com/leancloud/leanchat-ios/blob/master/LeanChat/LeanChat/controllers/entry/CDLoginVC.m)，它使用了该 SNS 组件，这里有个[视频演示](http://ac-x3o016bx.clouddn.com/a294809feb0c6a8a.mp4)。

### 导入 SDK
您可以使用 Podfile 通过 cocoapods 引入 SDK，

```sh
	pod 'LeanCloudSocial'
```

也可以在开源项目上编译 framework 加入到项目中，或者直接拖动源代码到项目中。

### SSO
利用SSO, 可以使用户不用输入用户名密码等复杂操作，一键登录。 **目前 LeanCloudSNS 已经支持新浪微博、手机 QQ 和微信, 并且不需要使用各个平台官方的 SDK, 保证您的应用体积最小化。**而你需要做的也很简单，以新浪微博为例：

```objc
[AVOSCloudSNS setupPlatform:AVOSCloudSNSSinaWeibo withAppKey:@"Weibo APP ID" andAppSecret:@"Weibo APP KEY" andRedirectURI:@""];

[AVOSCloudSNS loginWithCallback:^(id object, NSError *error) {
 	 if (error) {
 	 } else {
 	 	NSString *accessToken = object[@"access_token"];
      	NSString *username = object[@"username"];
      	NSString *avatar = object[@"avatar"];
      	NSDictionary *rawUser = object[@"raw-user"]; // 性别等第三方平台返回的用户信息
      	//...
 	 }
   } toPlatform:AVOSCloudSNSSinaWeibo];

```

在AppDelegate里添加:

```objc
-(BOOL)application:(UIApplication *)application handleOpenURL:(NSURL *)url{
    return [AVOSCloudSNS handleOpenURL:url];
}
```

这样, 代码部分就完成了. 下一步就是设置, 为你的app添加 URL Schemes: `sinaweibosso.appId`(注意有个点".")，像这样

![Url Shceme](images/sns_guide_url_scheme.png)

这时如果顺利, 应该可以正常的打开新浪微博官方iOS客户端进行登录了.

QQ的SSO与微博完全一致, 只是设置URL Schemes:`tencentappid`，微信则使用微信开放平台提供的 AppId，如 `wxa3eacc1c86a717bc`。

`+ (void)[AVOSCloudSNS loginWithCallback:toPlatform]` 接口当在相关应用安装的情况下，直接跳转到相关应用进行 SSO 授权，如果没有安装的话，则跳转至网页授权。网页授权需要用户输入账号、密码，体验较差，所以我们提供了 `+ (BOOL)[AVOSCloudSNS isAppInstalledForType:]`来让你检测相应的应用有没安装，没有安装的话可以提示用户或者隐藏按钮。

### 绑定 AVUser

先导入头文件:

```objc
# import <LeanCloudSocial/AVUser+SNS.h>
```

然后在登录SNS成功回调后`loginWithAuthData:block`,这样会用当前的SNS用户来尝试登录获取AVUser信息, 如果AVUser不存在, 系统会自动创建新用户并返回,如果已经存在, 则直接返回该用户.

```objc
[AVUser loginWithAuthData:object block:^(AVUser *user, NSError *error) {
     //返回AVUser
}];
```

如果需要为AVUser,可以用`addAuthData:block:`方法,比如:

```objc
[user addAuthData:object block:^(AVUser *user, NSError *error) {
     //返回AVUser
}];
```

**上述方法同样适用于`AVUser`的子类.**

### 手动显示登录界面
上面的例子中都是自动显示登录界面, 如果需要实现自定义显示方式,可以使用方法`loginManualyWithCallback:`, 请看下面的例子:

```objc
__block UIViewController *vc=nil;
vc= [AVOSCloudSNS loginManualyWithCallback:^(id object, NSError *error) {
    if (vc) {
        //关闭UIViewController

        //ARC模式中要将vc置空
        vc=nil;
    }
}];

if (vc) {
    //显示UIViewController
}
```

请注意代码提到的`ARC模式中要将vc置空`来打破retain环, 否则vc将不会被释放而浪费内存!


更多详细使用方法, 请前往[开源项目](https://github.com/leancloud/leancloud-social-ios)结合 Demo 学习。

## Android SNS 组件


AVOSCloud Android SNS 为开发人员提供了一个非常轻量的模块，使用此模块，您可以仅用少量代码便可实现社交平台用户登录的功能。

### 导入 SDK

您可以从 [本地下载](https://leancloud.cn/docs/sdk_down.html) Android SNS SDK（从1.4.4版本开始包括avossns的jar包），将下载的 jar 包加入您工程的 libs 目录。如果您还不知道如何安装 SDK，请查看[快速入门指南](/start.html)。

### WebView 授权

首先你需要在[管理界面](/devcomponent.html?appid={{appid}}#/component/sns)中间配置相应平台的 AppKey 与 AppSecret，在成功保存以后，页面上能够得到相应的`回调 URL`和`登录 URL`。你将在代码里用到`登录 URL`，同时请将`回调 URL`填写到对应平台的 App 管理中心（比如新浪开放平台）。

之后你需要在 AndroidManifest.xml 中间添加相应的 Activity:

```
        <activity
            android:name="com.avos.sns.SNSWebActivity" >
        </activity>
```

同时你需要拷贝我们准备的 res/avoscloud_sns_web_activity.xml 到你的项目中去。

之后在你需要授权的地方，你就可以通过 WebView 进行相应的授权：

```java
public class AuthActivity extends Activity{
    
   @Override 
   public void onCreate(Bundle savedInstanceState){
     SNS.setupPlatform(SNSType.AVOSCloudSNSSinaWeibo, "https://leancloud.cn/1.1/sns/goto/xxx");
     SNS.loginWithCallback(this, SNSType.AVOSCloudSNSSinaWeibo, new SNSCallback() {
       @Override
       public void done(SNSBase base, SNSException e) {
         if (e==null) {
           SNS.loginWithAuthData(base.userInfo(), new LogInCallback<AVUser>() {
             @Override
             public void done(final AVUser user, AVException e) {
             }
           });
         }
       }
     });
   }

   @Override
   protected void onActivityResult(int requestCode, int resultCode, Intent data) {
     super.onActivityResult(requestCode, resultCode, data);
     SNS.onActivityResult(requestCode, resultCode, data, type);
   }
}

```

这样就完成了新浪微博从授权到创建用户（登录）的一整套流程。
**注:由于微信的 Web 授权页面为扫描二维玛，现阶段仅仅支持新浪微博和 QQ 授权。**

### SSO 登录

利用 SSO, 用户可以使用单点登录功能，避免反复输入用户名和密码等，您可以使用以下代码轻松实现:

``` java
// 导入 SNS 组件
import com.avos.sns.*;

// 使用新浪微博 SNS 登录，在您的 Activity 中
public class MyActivity extends Activity {

  // onCreate 中初始化，并且登录
  @Override
  public void onCreate(Bundle savedInstanceState) {
        …
    // callback 函数
    final SNSCallback myCallback = new SNSCallback() {
      @Override
      public void done(SNSBase object, SNSException e) {
        if (e == null) {
          showText("login ok " + type );
        }
      }
    };

    // 关联
    SNS.setupPlatform(this, SNSType.AVOSCloudSNSSinaWeibo, "YOUR_SINA_WEIBO_APP_ID", "", "YOUR_SINAWEIBO_CALLBACK_URL");
    SNS.loginWithCallback(this, SNSType.AVOSCloudSNSSinaWeibo, myCallback);
  }

  // 当登录完成后，请调用 SNS.onActivityResult(requestCode, resultCode, data, type);
  // 这样您的回调用将会被调用到
  @Override
  protected void onActivityResult(int requestCode, int resultCode, Intent data) {
    super.onActivityResult(requestCode, resultCode, data);
    SNS.onActivityResult(requestCode, resultCode, data, type);
  }
}
```
您也可以将上述代码中的 SNSType.AVOSCloudSNSSinaWeibo 更换为 SNSType.AVOSCloudSNSQQ 便可以使用 QQ 的 SSO 登录功能。

** QQ SNS 在腾讯 SNS 授权中，由于 QQ SDK 官方对于 WebView 授权的限制，导致在 WebView 中无法完成正常的授权过程，所以 QQ SNS 只支持 SSO 登录授权。我们也会持续跟进 QQ SDK 的更新进展，同时也为对您造成的不便感到抱歉。

***QQ SSO 注意*** 当使用 QQ SSO 登录时，请注意确保您的AndroidManifest.xml文件中包含如下内容

```xml
<activity android:name="com.tencent.tauth.AuthActivity"
          android:noHistory="true"
          android:launchMode="singleTask">
    <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
    </intent-filter>
</activity>
```
***微博 SSO 注意*** 当使用微博 SSO 登录时，请注意确保您的AndroidManifest.xml文件中包含如下内容，否则在没有安装微博客户端的设备上，会出现问题。

```xml
<activity
   android:theme="@android:style/Theme.NoTitleBar"
   android:name="com.sina.weibo.sdk.component.WeiboSdkBrowser"
   android:configChanges="keyboardHidden|orientation"
   android:exported="false"
   android:windowSoftInputMode="adjustResize" >
</activity>
```

并下载 [libs 目录](https://github.com/sinaweibosdk/weibo_android_sdk/tree/master/libs)下的三个 .so 文件，导入到自己工程。

对于其他的 SSO 请确保您有如下权限

```xml
</application>
    <uses-permission android:name="android.permission.INTERNET"/>
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.VIBRATE"/>
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
</manifest>
```

### 绑定 LeanCloud User

您也可以将 SSO 登录后的帐号信息与 LeanCloud 的 User 绑定，通过绑定，您可以在两种用户体系间建立联系，方便信息的共享和使用。

如果您还未安装 LeanCloud Android SDK，请参阅[快速入门指南](/start.html)。

SSO 登录过程与上述代码都相同，您只需要在 callback 中进行关联即可，示例代码如下

```java
final SNSCallback myCallback = new SNSCallback() {
     @Override
     public void done(SNSBase object, SNSException e) {
         if (e == null) {
            SNS.associateWithAuthData(AVUser.getCurrentUser(), object.userInfo(), null);	    		
         }
     }
 };
```

上述代码，可以将您的 SNS 帐号与已经创建的 LeanCloud User 帐号绑定。您也可以使用 `loginWithAuthData`，它将为您创建一个新的匿名用户

```java
  SNS.loginWithAuthData(authData, new LogInCallback() {
    @Override
    public void done(AVUser avUser, AVException e) {
        if (e == null) {
            MyActivity.this.showText("create new user with auth data done");
        } else {
            MyActivity.this.showText("create new user with auth data error: " + e.getMessage());
        }
    }
});
```

*** 注:有用户表示想要从第三方授权中获取更多的信息包括用户名等信息，我们同样可以通过 `SNSBase.authorizedData()` 方法来获取授权返回的所有字段 ***

如果您不想再使用 SNS 相关的功能，您可以使用 `logout` 解除 SNS 帐号和 LeanCloud User 帐号的绑定。

```java
  SNS.logout(AVUser.getCurrentUser(), type, new SaveCallback() {
      @Override
      public void done(AVException e) {
      }
  });
```


更多详细使用方法, 请查看SDK API文档.

#### 不引入 SNS 模块的第三方账号与 AVUser 绑定

在实际的使用过程中，有一部分用户在涉及到 SNS 相关功能，比如分享模块时，引用了其他第三方库，然而这些库中所引用的 SNS jar 很有可能与 LeanCloud 存在版本的冲突。这个时候，用户往往非常的苦恼，无法解决这样的问题。考虑到这一部分用户的需求，我们在 AVUser 中间添加了几个类似的方法，以便用户能够更便捷地与 AVUser 进行绑定，从而快速的结合 LeanCloud 的用户系统。

通过 `AVUser.loginWithAuthData` 来创建一个匿名的 AVUser 对象：
```java
    AVUser.AVThirdPartyUserAuth userAuth = new AVUser.AVThirdPartyUserAuth(accessToken, expiresAt, snsType,openId);//此处snsType 可以是"qq","weibo"等字符串
    AVUser.loginWithAuthData(clazz, userAuth, callback);
```

或者通过 `AVUser.associateWithAuthData` 或者 `AVUser.dissociateAuthData` 来为一个已经存在的 AVUser 对象来绑定一个第三方账号或者解除第三方账号绑定：

```java
    AVUser.AVThirdPartyUserAuth userAuth = new AVUser.AVThirdPartyUserAuth(accessToken, expiresAt, snsType,openId)
    AVUser.associateWithAuthData(AVUser.getCurrentUser(),userAuth,callback);

    AVUser.dissociateAuthData(AVUser.getCurrentUser(),AVThirdPartyUserAuth.SNS_TENCENT_WEIBO,callback);// 解除腾讯微薄的账号绑定
```

如果您使用了 ShareSDK 来实现分享和第三方登录的功能，能也可以非常轻松的完成和 AVUser 的绑定。以新浪微博为例

```java
   Platfrom plat = new SinaWeibo(getActivity());
   if (plat.isValid()){
   //如果已经授权过了，直接拿出来用
        String userId = plat.getDb().getUserId();
        if (!Utils.isNullOrEmpty(userId)) {

        //绑定第三方的授权信息
          AVUser.AVThirdPartyUserAuth auth =
              new AVUser.AVThirdPartyUserAuth(plat.getDb().getToken(), String.valueOf(plat.getDb()
                  .getExpiresTime()), AVUser.AVThirdPartyUserAuth.SNS_SINA_WEIBO, plat.getDb()
                  .getUserId());
          AVUser.loginWithAuthData(auth, new LogInCallback<AVUser>() {

            @Override
            public void done(AVUser user, AVException e) {
              if (e == null) {
              //恭喜你，已经和我们的AVUser绑定成功
              } else {
                e.printStackTrace();
              }
            }
          });
          return;
        }
   }
      //如果尚未授权，则通过 ShareSDK 完成授权
      plat.setPlatformActionListener(new PlatformActionListener() {

        @Override
        public void onError(Platform arg0, int arg1, Throwable arg2) {

        }

        @Override
        public void onComplete(Platform plat, int arg1, HashMap<String, Object> arg2) {
        //授权已经完成
        //绑定第三方的授权信息
          AVUser.AVThirdPartyUserAuth auth =
              new AVUser.AVThirdPartyUserAuth(plat.getDb().getToken(), String.valueOf(plat.getDb()
                  .getExpiresTime()),AVUser.AVThirdPartyUserAuth.SNS_SINA_WEIBO , plat.getDb()
                  .getUserId());
          AVUser.loginWithAuthData(auth, new LogInCallback<AVUser>() {

            @Override
            public void done(AVUser user, AVException e) {
              if (e == null) {
              //恭喜你，已经和我们的 AVUser 绑定成功
              } else {
                e.printStackTrace();
              }
            }
          });
        }

        @Override
        public void onCancel(Platform arg0, int arg1) {

        }
      });
      plat.SSOSetting(true);
      plat.showUser(null);
```
