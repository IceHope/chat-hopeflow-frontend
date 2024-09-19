# Frontend 前端页面,说明交互的UI
 后端工程链接:[chat-hopeflow-backend](https://github.com/IceHope/chat-hopeflow-backend)

## 1. 安装方式

## Vercel 部署地址

[HopeGpt](https://chat.icehopeflow.cn/home)

## 本地源代码安装

- Project Setup

```sh
npm install
```

- Compile and Hot-Reload for Development

```sh
npm run dev
```

- Type-Check, Compile and Minify for Production

```sh
npm run build
```

## 2. 代码架构

- 代码使用Vue ,TypeScripts, 组件使用Element Plus

- Router管理路由,Modul store 管理全局配置,状态,interface定义公共接口

- View一级界面组件,Componenst子界面组件

## 3. 页面概览

- 登录界面
  
  ![Login](doc/images/login.png)
  
  简单的注册,登录,方便使用username和sesion_id保存历史对话记录,注册的用户名不能重复,忘记密码可以点击忘记密码,后台直接返回密码

- 聊天界面
  
  - 聊天的历史记录保存,UI模仿ChatGPT
    
    ![History](doc/images/history.png)
    
    - 使用username和session_id,按照时间顺序保存在redis,点击item,可以查看对应的聊天内容
    
    - 可以手动展开,关闭聊天记录UI
    
    - 新建对话
    
    - 支持点击删除
  
  - 模型的选择
    
    ![](doc/images/model_select.png)
    
    - 点击左上角,展开所有模型
      
      - Openai Claude Genimi 等国外主流先进的模型
      
      - 国内所有厂商的,默认是智谱免费的GLM-4-Flash
    
    - Item的右边是价格 输入价格/输出价格,单位是1M的tokens
  
  - 聊天界面
    
    ![](doc/images/modal.png)
    
    - 支持多轮对话,Redis存取历史记录
    
    - 每次对话结束,弹出3个建议问题
    
    - 流式输出的同时,可以手动停止
    
    - 支持多模态图文对话,为了方便保持聊天记录,图片保存在了腾讯云服务器
  
  - 知识库
    
    - 列表展示所有文件
    
    ![](doc/images/kb_list.png)
    
    - 针对单个文件的分析
      
      - 可视化查看分块页面
        
        ![](doc/images/kb_item.png)
      
      - 点击查看详情,支持PDF中图片的展示
        
        ![](doc/images/kb_detail.png)
      
      - 关键字搜索
      
      - ![](doc/images/kb_keyword.png)
      
      - 向量搜索 top_k=6
      
      - ![](doc/images/kb_vector.png)

- RAG问答
  ![](doc/images/rag.png)
  
  - 可视化配置
    
    - 对话设置
      
      - 详细的RAG流程,默认打开,可以手动切换
      
      - 是否支持多轮对话,多轮对话中,要结合前面的问题,提交给大模型,对最新的问题,意图解析
    
    - 召回设置
      
      默认召回3个文本,然后检索扩大为6个文本,重排序之后再保存最终的3个文本,用于最终生成
    
    - 模型设置
      
      - 多模态模型,检索到PDF的图片或者图片文档时,单独用多模态模型,进行问答
      
      - 重排序模型, 暂时支持jina的在线API排序,bge本地模型
  
  - 问答过程
    
    - 详细的RAG流程, 特别的展示了PDF中图片的处理
      
      ![](doc/images/rag_img.png)
    
    - 文本块详情
      ![](doc/images/rag_chat_detail.png)
      
      - score是重排序模型返回的原始数据
      - PDF图片的文件路径,是同名PDF文件夹的下面路径,详细逻辑参考后端工程

- Agent
  ![](doc/images/agent.png)

  - 三步翻译法
    
    ![](doc/images//translate.png)
  
  - 六顶思维帽

    ![](doc/images/six_hat.png)
  
  - 长故事创作
    
    - 可视化配置
      流程图
      ![](doc/images//storyline_flow.png)
    
    - 全程自动生成
    
      ![](doc/images/storyline_auto.png)

    - 全程人工确认
      ![](doc/images/storyline_handle.png)