import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChange,
  SimpleChanges
} from '@angular/core';
import { bus, preloadApp, startApp as rawStartApp, destroyApp, setupApp, plugin } from 'wujie';

/**
 * 无界微前端angular组件封装
 */
@Component({
  selector: 'ngx-wujie',
  template: '',
  host: {
    '[style.width]': 'width',
    '[style.height]': 'height'
  }
})
export class WujieComponent implements OnInit, OnChanges, OnDestroy {
  /**
   * event bus
   */
  static bus = bus;
  /**
   * 缓存子应用配置
   */
  static setupApp = setupApp;
  /**
   * 预加载无界APP
   */
  static preloadApp = preloadApp;
  /**
   * 销毁无界APP
   */
  static destroyApp = destroyApp;

  /**
   * 唯一性用户必须保证
   */
  @Input() name!: string;
  /**
   * 需要渲染的url
   */
  @Input() url!: string;
  /**
   * 代码替换钩子
   */
  @Input() replace?: (code: string) => string;
  /**
   * 自定义fetch
   */
  @Input() fetch?: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
  /**
   * 注入给子应用的属性
   */
  @Input() props?: Record<string, any>;

  /**
   * 自定义iframe属性
   */
  @Input() attrs?: Record<string, any>;

  /**
   * 子应用采用fiber模式执行
   */
  @Input() fiber?: boolean;
  /**
   * 子应用保活，state不会丢失
   */
  @Input() alive?: boolean;
  /**
   * 子应用采用降级iframe方案
   */
  @Input() degrade?: boolean;
  /**
   * 子应用插件
   */
  @Input() plugins?: Array<plugin>;
  /**
   * 子应用生命周期
   */
  @Output() beforeLoad = new EventEmitter<Window>();
  @Output() beforeMount = new EventEmitter<Window>();
  @Output() afterMount = new EventEmitter<Window>();
  @Output() beforeUnmount = new EventEmitter<Window>();
  @Output() afterUnmount = new EventEmitter<Window>();
  @Output() activated = new EventEmitter<Window>();
  @Output() deactivated = new EventEmitter<Window>();
  @Input() loadError = new EventEmitter<{ url: string; err: Error }>();

  /**
   * 所有事件
   */
  @Output() events = new EventEmitter<{ event: string; args: Array<any> }>();

  /**
   * 路由同步开关
   * 如果false，子应用跳转主应用路由无变化，但是主应用的history还是会增加
   * https://html.spec.whatwg.org/multipage/history.html#the-history-interface
   */
  @Input() sync?: boolean;
  /**
   * 子应用短路径替换，路由同步时生效
   */
  @Input() prefix?: Record<string, string>;
  /** 子应用加载时loading元素 */
  @Input() loading?: ElementRef | HTMLElement;

  /**
   * 控件宽度
   */
  @Input() width?: string;
  /**
   * 控件高度
   */
  @Input() height?: string;

  private get _loading() {
    return (this.loading as ElementRef)?.nativeElement || this.loading;
  }

  startAppQueue: Promise<Function | void> = Promise.resolve();
  constructor(private wujieElementRef: ElementRef) {}

  ngOnInit(): void {
    bus.$onAll(this.handleEmit);
    this.execStartApp();
  }

  private startApp() {
    return rawStartApp({
      name: this.name,
      url: this.url,
      el: this.wujieElementRef.nativeElement,
      loading: this._loading,
      alive: this.alive,
      fetch: this.fetch,
      props: this.props,
      attrs: this.attrs,
      replace: this.replace,
      sync: this.sync,
      prefix: this.prefix,
      fiber: this.fiber,
      degrade: this.degrade,
      plugins: this.plugins,
      beforeLoad: appWindow => this.beforeLoad.emit(appWindow),
      beforeMount: appWindow => this.beforeMount.emit(appWindow),
      afterMount: appWindow => this.afterMount.emit(appWindow),
      beforeUnmount: appWindow => this.beforeUnmount.emit(appWindow),
      afterUnmount: appWindow => this.afterUnmount.emit(appWindow),
      activated: appWindow => this.activated.emit(appWindow),
      deactivated: appWindow => this.deactivated.emit(appWindow),
      loadError: (url, err) => this.loadError.emit({ url, err })
    });
  }

  /**
   * 监听事件
   * @param event
   * @param args
   */
  private handleEmit(event: string, ...args: Array<any>): any {
    this.events.emit({ event, args });
  }

  private execStartApp() {
    this.startAppQueue = this.startAppQueue.then(this.startApp.bind(this));
  }

  ngOnChanges(changes: { [P in keyof this]?: SimpleChange } & SimpleChanges): void {
    if ((changes.name && !changes.name.isFirstChange()) || (changes.url && !changes.url.isFirstChange())) {
      this.execStartApp();
    }
  }

  ngOnDestroy(): void {
    destroyApp(this.name);
    bus.$offAll(this.handleEmit);
  }
}
