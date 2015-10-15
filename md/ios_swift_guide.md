# Swift 开发指南

这篇指南专门列举一下 Swift 下需要注意的问题和一些接口调用示例。希望大家同时结合 [Objective-C 文档](./ios_os_x_guide.html)来学习。

目前提供了以下 Swift 资源：

* [LeanStorageDemo-iOS](https://github.com/leancloud/LeanStorageDemo-iOS) 。存储功能示例项目，其中有 Swift 版本，展示了上百个接口的调用，覆盖存储功能的方方面面。
* [LeanCloud-Demos-Swift](https://github.com/leancloud/leancloud-demos#swift) 。其它 Swift 项目，有照片墙、朋友圈小应用，展示了在实际项目中如何使用 LeanCloud SDK。
* [使用 Swift 和 LeanCloud 构建 iOS 应用](https://blog.leancloud.cn/1407) 博文。文中介绍了如何在 Xcode 中创建 Swift 项目、引入 LeanCloud SDK、创建桥接头、简单存储一个对象。

## 引入 SDK

我们推荐用 Cocoapods 的方式引入 SDK，在 Podfile 中加入：

```sh
platform :ios, '8.0'
use_frameworks!

target 'YourTarget' do
    pod 'AVOSCloudDynamic'      # 存储模块
    pod 'AVOSCloudIMDynamic'    # 实时通信模块
    ...
end
```

之后可运行 `pod install --verbose` 来安装 SDK。第一次安装后，可加选项 `--no-repo-update` 来加快 pod 的安装。

如果需要手动引入 SDK，可参考[快速入门指南](https://leancloud.cn/docs/start.html)与[使用 Swift 和 LeanCloud 构建 iOS 应用](https://blog.leancloud.cn/1407)博文。

## 子类化

以下给出一个 AVObject 子类的参考：

```swift
import UIKit
import AVOSCloud

class Post: AVObject, AVSubclassing {
    
    @NSManaged var content: NSString?

    @NSManaged var pictures: [String]?
    
    @NSManaged var author: AVUser?

    @NSManaged var likes: [AVUser]?

    @NSManaged var image: AVFile?
    
    static func parseClassName() -> String! {
        return "Post"
    }
}

```

并在初始化的地方调用 _Post.registerSubclass()_ 。

这里的变量名 content、author 等需要和控制台里的字段名相对应，并加上 `@NSManaged` 关键字。同时需要实现 AVSubclassing 协议，复写 parseClassName 方法，返回值对应控制台里的表名。这里的类名 Post 可以是其它名称，如 PostModel 。字段的值可能为空的话，需要加 ? 符号。

## 调用示例

保存对象：

```swift
        let post = AVObject(className: "Post")
        post.setObject("每个 iOS 程序员必备的 8 个开发工具", forKey: "content")
        post["author"] = AVUser.currentUser()  // 下标法
        post.saveInBackgroundWithBlock({(succeeded: Bool, error: NSError?) in
            if error != nil {
            	// 保存出错了
	        } else {
	        	// 保存成功
		    }
        })
```

或者使用之前定义的子类：

```swift
        let post = Post()
        post.content = "每个 iOS 程序员必备的 8 个开发工具"
        post.author = AVUser.currentUser()
        post.saveInBackgroundWithBlock({(succeeded: Bool, error: NSError?) in
            if error != nil {
                // ...
	        } else {
	        	// ...
		    }
        })
```

查询对象：

```swift
        let query = Post.query() // 或者 let query = AVQuery(className:"Post")
        query.whereKey("author", equalTo: AVUser.currentUser())
        query.limit = 5
        query.findObjectsInBackgroundWithBlock({(objects: [AnyObject]?, error: NSError?) in
        	if error != nil {
        		//...
	        } else {
	        	for post in objects as! [Post] {
                    print("author:\(post.author) content:\(post.content)");
                }
	        }
        })
```

更多例子请参考 [LeanStorageDemo-iOS](https://github.com/leancloud/LeanStorageDemo-iOS)。
