{% import "views/_helper.njk" as docs %}
# _helper 宏方法的用法

`_helper.njk` 包含了格式化文档的常用方法。要使用这些方法，需要在文件的最开始加入：

<pre><code class="lang-nunjucks">&lbrace;% import "views/_helper.njk" as docs %&rbrace;{% raw %}{% set a = 3 %}{% endraw %}
</code></pre>

注意将其 namespace 设置为 **`docs`**，与其他宏文件如 `_storage.njk`、`_sms.njk` 区别开来。

## `note()`

```
{% raw %}{{ docs.note("callout-info 类型的提示。") }}{% endraw %}
```
效果：

{{ docs.note("callout-info 类型的提示。") }}

## `alert()`

```
{% raw %}{{ docs.alert("callout-danger 类型的提示。用于突出强调或警告。") }}{% endraw %}
```
效果：

{{ docs.alert("callout-danger 类型的提示。用于突出强调或警告。") }}

## `paragraph()`

将输入内容中的换行替换为 html 的 `<p></p>`，内部方法，被 `alert()` 和 `info()` 调用。

```html
{% raw %}{{ docs.paragraph("第一行。
第二行。") }}{% endraw %}
{% raw %}{{ docs.paragraph("只有一行的文本。") }}{% endraw %}

<!-- 结果 -->
<p>第一行。</p><p>第二行。</p>
<p>只有一行的文本。</p>
```
