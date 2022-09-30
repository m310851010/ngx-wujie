# ngx-wujie

[wujie（无界）](https://github.com/Tencent/wujie) angular实现。angular项目作为主应用才需要安装。

## 使用环境

- angular 9+

## 快速上手

### 安装

```bash
npm i @xmagic/ngx-wujie
```

### 引入

```diff
// app.module.ts
+ import { WujieModule } from '@xmagic/ngx-wujie';

@NgModule({
  imports: [
+   WujieModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
```



### 使用

```html
<ngx-wujie
  width="100%"
  height="100%"
  name="xxx"
  [url]="xxx"
  [sync]="true"
  [fetch]="fetch"
  [props]="props"
  (beforeLoad)="beforeLoad"
  (beforeMount)="beforeMount"
  (afterMount)="afterMount"
  (beforeUnmount)="beforeUnmount"
  (afterUnmount)="afterUnmount"
></ngx-wujie>
```

## 参考文档

[wujie（无界）官方文档](https://wujie-micro.github.io/doc/)
