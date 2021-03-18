# CDN 配置指南

对服务可控性及可用性有较高要求的开发者可以视项目的具体情况接入第三方 CDN 服务。
这篇指南简要介绍了配置 CDN 的具体步骤。

## 接入第三方 CDN 的使用场景

下面我们列举了一些常见的接入第三方 CDN 的使用场景，供大家参考：

- 加速静态资源访问

    通常 CDN 对静态资源的加速效果比较显著。如果你想要为部署在云引擎上的纯静态站点接入第三方 CDN，那么也可以考虑直接使用[云引擎内置的加速节点功能](custom-api-domain-guide.html#云引擎域名)，配置更加方便。

- 加速动态请求访问

    由于每个动态请求都需要回源（CDN 转发客户端请求至源站，收到源站响应再发给客户端），因此 CDN 对动态请求的加速效果一般没有那么明显。当然，全国各地、各运营商的线路千差万别，接入第三方 CDN 后在个别线路上可能会有显著的加速效果，这也取决于具体的第三方 CDN 对不同线路的优化情况。需要注意的是，许多 CDN 供应商提供的产品会有静态 CDN 和动态 CDN 的区分，这种情况下请选择为动态请求优化的产品。

- 加速境外访问

    我们推荐主要面向境外用户的应用使用 [LeanCloud 国际版][intl]，国际版的机房在海外，境外用户访问较快。同时面向境内外用户的应用，可以考虑在华北节点或华东节点创建应用，然后接入第三方 CDN 缓解境外用户访问缓慢的问题。当然，这需要开发者挑选一家境内外节点丰富、回源 LeanCloud 华北或华东节点速度较快、支持动态请求的第三方 CDN 服务商。同时面向境内外用户，且希望境外用户能有更优访问速度的商用版用户，可以提工单联系我们开通专线。一般来说，相比通过公网回源 LeanCloud 华北或华东节点的第三方 CDN，专线能更好地优化境外用户访问速度。不过，在访问量较小的情况下，专线的成本比较高。

- 缓解 DDoS 攻击

    除了部署在云引擎上的纯静态站点以外，我们推荐每个应用使用[独立 IP](custom-api-domain-guide.html#独立_IP)。每一个独立 IP 默认提供了 2 Gbps 的防护带宽，可以防护小规模的攻击。在遇到更大规模攻击的情况下，我们也可以协助你接入第三方清洗服务。取决于攻击的类型，接入 CDN 也可以对 DDoS 攻击起到不同程度的缓解作用。许多 CDN 供应商还提供专门的防 DDoS 附加功能（通常成本较高），可以应对大规模的 DDoS 攻击。

[intl]: https://leancloud.app

## 准备工作

在选定符合需要的第三方 CDN 供应商后，请准备一个已备案的域名，并规划好供客户端访问的子域名和作为回源 Host 的域名：

- 供客户端访问的子域名，比如 `foo.example.com`，这个域名将作为最终提供服务的域名。多个云引擎分组需要分别准备各自的子域名，多个应用的 API 可以共用一个子域名。以下简称 CDN 域名。
- 在 LeanClodu 控制台绑定的子域名，比如 `bar.example.com`。这个域名将作为回源 Host。多个云引擎分组、多个应用的 API 都需要分别准备各自的子域名作为回源 Host。如果是出于缓解 DDoS 攻击的目的接入 CDN，推荐使用**复杂的长随机字符串**（`some-long-random-string.example.com`），以免恶意攻击者基于常用词字典穷举出子域名（当然这类攻击发生的可能性较小），并注意保护回源 Host 的私密性。以下简称回源域名。

API 与云引擎的 CDN 不能混用，需要分别配置，下面提到的所有概念如果没有特殊说明，都不再区分 API 与云引擎服务。
## 向 LeanCloud 申请回源 IP

LeanCloud 华北节点需要进行的设置如下：

- 申请独立 IP 作为回源 IP
- 绑定回源域名

同一账号下的多个应用的 API 或者多个云引擎分组可以共用一个 IP，但 API 与云引擎之间不能共用。
独立 IP 可以直接在控制台（**账号设置 > 独立 IP**）申请，如果当前账号已经申请了独立 IP，那么可以直接使用已有的独立 IP。
但如果是出于缓解 DDoS 攻击的目的接入第三方 CDN，那么建议专门申请 IP 以确保回源 IP 的私密性，并**特别注意不要泄露回源 IP**。

在 LeanCloud 控制台绑定作为回源域名（上一节例子中的 `bar.example.com` 或 `some-long-random-string.example.com`），其中，DNS 解析指向独立 IP（回源 IP），SSL 选择自动管理模式（如果你有自己的证书，也可以选择手动模式，上传证书）。等待绑定成功后前往第三方 CDN 供应商处配置。

华东节点的流程与华北节点基本一致，只是目前还不支持在控制台自动申请 IP，请通过工单系统提出申请。

## 配置 CDN

接下来请在 CDN 服务商处增加一个 CDN。每个服务商提供的配置界面与文案会略有不同，如果对具体的配置项有疑问，可以联系服务商的技术支持。需要对该 CDN 进行如下配置：

- 域名与证书：准备的最终提供服务的子域名（[准备工作](#准备工作)一节例子中的 `foo.example.com`）与证书（许多 CDN 供应商都可以自动申请证书），并按照提示配置对应的 DNS 解析记录。
- 回源 IP
- 回源 Host（回源域名）
- 回源协议（如有，选择 https）

在配置完成之后，可以通过下面的请求验证配置的正确性：

- `dig foo.example.com` (应该返回指向 CDN 的解析记录，如果之前使用过这个域名，可能需要等待 DNS 解析记录生效)
- 如果是 API 服务： `https://foo.example.com/1.1/date`（应该每次都返回当前的时间）
- 如果是云引擎服务： `https://foo.example.com/__engine/1/ping` 或 `https://foo.example.com/` （参见关于云引擎[健康监测](leanengine_webhosting_guide-node.html#健康监测)的说明）

如果是出于缓解 DDoS 攻击的目的接入 CDN，在确认 CDN 工作正常后，可以移除回源域名的 DNS 解析记录，降低回源 IP 的泄露风险（但不要在 LeanCloud 控制台解绑回源域名，否则回源 Host 无法工作）。

## 常见问题

### 我已经在使用 LeanCloud 绑定的自有域名，可以不换域名切换到基于 CDN 的方案吗

可以。你可以用现在已经绑定的二级域名作为 CDN 的域名，所有配置的方法都与上述一致。完成配置后将该域名 DNS CNAME 记录从指向 LeanCloud 切换到指向 CDN，即可完成切换。需要特别注意 CDN 提供商有可能会需要验证 DNS CNAME 记录后才能完成配置，那样可能无法避免切换时的服务中断，请向 CDN 服务商咨询解决方案。另外要注意的是，在切换了 DNS 记录后，LeanCloud 上绑定的域名的证书将无法自动续期。

### CDN 缓存了动态的资源

请检查 CDN 的缓存控制相关的配置，建议设置为「遵循相关 header」，对于 API 服务可以直接设置为「均不缓存」。有部分服务商还会提供「忽略 URL 中的参数」的功能，请确保该功能是关闭的。

### 跨域访问出现异常

如果你的应用是 WebApp，在访问 CDN 域名的 API 服务的时候出现了 CORS 相关的异常，请先通过下面的命令检查返回的 Header 中是否有正确的 CORS 相关的 header（`access-control-allow-origin`，`access-control-allow-methods` 与 `access-control-allow-headers`）：

```sh
curl 'https://example.yourdomain.com/1.1/ping' \
    -X OPTIONS -H 'Access-Control-Request-Method: GET' \
    -H 'Access-Control-Request-Headers: content-type,x-lc-id,x-lc-prod,x-lc-session,x-lc-sign,x-lc-ua' \
    -H 'Origin: http://localhost' -i
```

如果没有正确的响应或者 header 不正确，请检查 CDN 的跨域访问配置，以下是参考配置：

```
access-control-allow-origin: *
access-control-allow-methods: GET, HEAD, POST, PUT, DELETE, OPTIONS, PATCH
access-control-max-age: 86400
access-control-allow-headers: Content-Type, Origin, X-LC-Id, X-LC-Key, X-LC-Sign, X-LC-Session, X-LC-Prod, X-LC-UA, X-LC-IM-Session-Token
```

### 获取客户端 IP

配置了 CDN 后，因为所有请求会经过 CDN 中转，API 的请求日志、云函数中的 `req.meta.remoteAddress` 和云引擎中的 `req.headers['x-real-ip']` 获取到的将是 CDN 节点的 IP 而不是客户端的实际 IP。

如果你的业务需要客户端 IP 的话，可以参照 CDN 供应商的文档来从 Header 中（一般是 `X-Forwarded-For`）获取实际 IP。注意因为 LeanCloud 的负载均衡总是会覆盖 `X-Real-IP` 这个头，所以如果 CDN 供应商只在 `X-Real-IP` 上发送实际 IP 的话，目前确实没有办法获得到这个 IP。

### CDN 域名和回源域名可以是同一个吗

我们不推荐这样配置。
由于 CDN 供应商和 LeanCloud 的 IaaS 供应商可能存在交叉，这样配置有可能因为域名记录冲突导致域名绑定失败。
另外，如果是出于缓解 DDoS 攻击的目的接入 CDN，这样配置的情况下，回源域名是公开的，在绑定域名、确认 CDN 正常工作的窗口期，攻击者可以通过 DNS 查询获取回源 IP。
攻击者获知回源 IP 后，随时可以绕过 CDN 直接攻击源站。

### 我没有独立 IP，可以通过设置源站域名回源的方式接入第三方 CDN 吗

我们不支持这样的用法。
由于 LeanCloud 的域名绑定系统在设计时没有考虑这种使用场景，你在域名绑定环节、第三方 CDN 配置时都可能遇到问题，我们不对此提供技术支持。
因为未指向独立 IP 的 API 域名没有可用性保证，即使接入了第三方 CDN，你的应用也可能因为共享同一 IP 的其他应用遭到 DDoS 攻击受到牵连。
未使用独立 IP 的云引擎应用使用为静态站点优化的加速节点，额外接入第三方 CDN，可能导致访问缓慢甚至出错。 
