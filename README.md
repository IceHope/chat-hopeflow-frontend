# Frontend 前端页面

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
  
  ![Login](doc/login.png)

  
  简单的注册,登录,方便使用username和sesion_id保存历史对话记录,注册的用户名不能重复,忘记密码可以点击忘记密码,后台直接返回密码
  
  

- 聊天界面
  
  - 聊天的历史记录保存,UI模仿ChatGPT
    
    <img title="" src="file:///C:/Users/iceHope/AppData/Roaming/marktext/images/2024-09-14-09-34-25-image.png" alt="" width="669">
    
    - 使用username和session_id,按照时间顺序保存在redis,点击item,可以查看对应的聊天内容
    
    - 可以手动展开,关闭聊天记录UI
    
    - 新建对话
    
    - 支持点击删除
  
  - 模型的选择
    
    ![](C:\Users\iceHope\AppData\Roaming\marktext\images\2024-09-14-09-43-50-image.png)
    
    - 点击左上角,展开所有模型
      
      - Openai Claude Genimi 等国外主流先进的模型
      
      - 国内所有厂商的,默认是智谱免费的GLM-4-Flash
    
    - Item的右边是价格 输入价格/输出价格,单位是1M的tokens
  
  - 聊天界面
    
    ![](C:\Users\iceHope\AppData\Roaming\marktext\images\2024-09-14-10-01-43-image.png)
    
    - 支持多轮对话,Redis存取历史记录
    
    - 每次对话结束,弹出3个建议问题
    
    - 流式输出的同时,可以手动停止
    
    - 支持多模态图文对话,为了方便保持聊天记录,图片保存在了腾讯云服务器
  
  - 知识库
    
    - 列表展示所有文件
    
    ![](C:\Users\iceHope\AppData\Roaming\marktext\images\2024-09-14-10-37-53-image.png)
    
    - 针对单个文件的分析
      
      - 可视化查看分块页面
        
        ![](C:\Users\iceHope\AppData\Roaming\marktext\images\2024-09-14-10-54-21-image.png)
      
      - 点击查看详情,支持PDF中图片的展示

        ![](C:\Users\iceHope\AppData\Roaming\marktext\images\2024-09-14-11-02-01-image.png)
    
      - 关键字搜索
    
      - ![](C:\Users\iceHope\AppData\Roaming\marktext\images\2024-09-14-10-58-24-image.png)
    
      - 向量搜索 top_k=6
    
      - ![](C:\Users\iceHope\AppData\Roaming\marktext\images\2024-09-14-11-00-06-image.png)

- RAG问答

- Agent
