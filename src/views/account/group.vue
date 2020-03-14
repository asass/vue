<template>
  <div class="app-container">
    <el-form :inline="true">
      <el-row>
        <el-form-item label="加群数">
          <el-input
            v-model="groupNum"
            placeholder="每个账号加群数(1-100)"
            oninput="value=value.replace(/[^\d]/g,'');if(value>100)value=100;if(value<1)value=1"
          />
        </el-form-item>
        <el-form-item label="间隔时间">
          <el-input
            v-model="sleepTime"
            placeholder="加群间隔时间(秒)"
            oninput="value=value.replace(/[^\d]/g,'');if(value<1)value=1;if(value>600)value=600"
          />
        </el-form-item>
      </el-row>
      <el-row>
        <el-button @click="initWebSocket()">重连</el-button>
        <el-button @click="group()">加群</el-button>
        <el-button @click="stop()">停止</el-button>
      </el-row>
      <el-input
        v-model="textarea"
        style="margin-top: 20px"
        class="textarea"
        type="textarea"
        :rows="10"
      />
    </el-form>

  </div>
</template>

<script>
import { wsIp } from '@/api/global'
export default {
  data() {
    return {
      data: this.$route.params,
      textarea: '',
      websock: null,
      groupNum: '',
      sleepTime: ''
    }
  },
  created() {
    this.validationData()
    this.initWebSocket()
  },
  beforeDestroy() {
    this.websocket.close()
  },
  methods: {
    validationData() {
      if (!this.data.userids) {
        this.$message.error('未检测到登录账号，跳转到账号登录界面。')
        this.$router.push({ path: '/账号管理/账号登录' })
      }
    },
    initWebSocket() {
      if ('WebSocket' in window) {
        this.websocket = new WebSocket('ws://' + wsIp + '/ws?uid=666&gid=777')
        // 连接错误
        this.websocket.onerror = this.setErrorMessage
        // 连接成功
        this.websocket.onopen = this.setOnopenMessage
        // 收到消息的回调
        this.websocket.onmessage = this.setOnmessageMessage
        // 连接关闭的回调
        this.websocket.onclose = this.setOncloseMessage
        // 监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
        window.onbeforeunload = this.onbeforeunload
      } else {
        this.$message.error('当前浏览器 Not support websocket')
      }
    },
    initAccountInfo() {
      this.data.userids.forEach(info => {
        this.addTextarea('账号"' + info + '"准备就绪')
      })
    },
    setErrorMessage() {
      this.setTextarea('连接失败')
    },
    setOnopenMessage() {
      this.setTextarea('连接成功')
      this.initAccountInfo()
    },
    // 收到消息的回调
    setOnmessageMessage(event) {
      this.addTextarea(event.data)
    },
    // 滚动到底部
    scrollToBottom() {
      this.$nextTick(() => {
        var scrollTop = this.$el.querySelector('.el-textarea__inner')
        scrollTop.scrollTop = scrollTop.scrollHeight
        // setTimeout(() => {
        //   var scrollTop = this.$el.querySelector('.el-textarea__inner')
        //   scrollTop.scrollTop = scrollTop.scrollHeight
        // }, 1000)
      })
    },
    // 连接关闭的回调
    setOncloseMessage() {
      this.addTextarea('连接已关闭')
    },
    // 监听窗口关闭事件
    onbeforeunload() {
      this.websocket.close()
    },
    // websocket发送消息
    send(msg) {
      this.websocket.send(msg)
    },
    // 关闭窗口时调用关闭websocket
    closeWebSocket() {
      if (this.websocket) {
        this.websocket.close()
      }
    },
    // 添加客户端内容
    addTextarea(text) {
      this.textarea += '\r\n' + text
      this.scrollToBottom()
    },
    setTextarea(text) {
      this.textarea = text
    },

    uuid() {
      var s = []
      var hexDigits = '0123456789abcdef'
      for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
      }
      s[14] = '4' // bits 12-15 of the time_hi_and_version field to 0010
      s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1) // bits 6-7 of the clock_seq_hi_and_reserved to 01
      s[8] = s[13] = s[18] = s[23] = '-'

      var uuid = s.join('')
      return uuid
    },
    // 加群
    group() {
      if (!this.sleepTime) {
        this.$message.error('间隔时间不能为空')
        return
      } else if (!this.groupNum) {
        this.$message.error('加群数不能为空')
        return
      }

      const acconutInfo = { code: 1, userids: this.data.userids, sleepTime: this.sleepTime, groupNum: this.groupNum }
      this.send(JSON.stringify(acconutInfo))
    },
    stop() {
      const info = { code: 2 }
      this.addTextarea('停止中，请等待服务器的响应')
      this.send(JSON.stringify(info))
    }
  }
}
</script>
