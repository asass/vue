<template>
  <div class="app-container">
    <el-row>
      <el-col :span="8">
        <el-upload
          ref="upload"
          name="files"
          style="text-align: center"
          :action="uploadAccountUrl"
          accept="text/plain"
          :multiple="false"
          :limit="1"
          :show-file-list="true"
          :on-success="uploadSuccess"
          :on-error="uploadError"
          :before-upload="uploadBefore"
          drag
        >
          <i class="el-icon-upload" />
          <div class="el-upload__text">
            将账号文本拖到此处，或<em>点击上传</em>
          </div>
        </el-upload>
      </el-col>
      <el-col :span="8">
        <el-upload
          ref="uploadProxy"
          name="proxyFiles"
          style="text-align: center"
          :action="uploadProxyUrl"
          accept="text/plain"
          :multiple="false"
          :limit="1"
          :show-file-list="true"
          :on-success="uploadProxySuccess"
          :on-error="uploadError"
          drag
        >
          <i class="el-icon-upload" />
          <div class="el-upload__text">
            将代理文本拖到此处，或<em>点击上传</em>
          </div>
        </el-upload>
      </el-col>
    </el-row>
    <el-divider />
    <div style="float:left;margin-left:10px">
      <el-checkbox v-model="proxyChecked" @change="proxyCheckedChange()">启用代理</el-checkbox>
      <el-radio-group v-model="proxyRadio" :disabled="proxyDisabled" style="margin-left:10px">
        <el-radio-button label="socks5">socks5</el-radio-button>
        <el-radio-button label="socks4">socks4</el-radio-button>
        <el-radio-button label="http">http</el-radio-button>
      </el-radio-group>
    </div>
    <div style="float:right">
      <el-button :disabled="proxyDisabled" @click="changeProxy()">切换代理</el-button>
      <el-button :disabled="loginDisabled" @click="loginSelection()">登录</el-button>
      <el-button @click="group()">加群</el-button>
    </div>
    <el-table
      ref="multipleTable"
      v-loading="listLoading"
      element-loading-text="加载中"
      :data="accountData"
      tooltip-effect="dark"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        type="selection"
        width="55"
      />
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-form label-position="left" class="demo-table-expand">
            <el-form-item label="wxid：">
              <span>{{ props.row.wxid }}</span>
            </el-form-item>
            <el-form-item label="昵称：">
              <span>{{ props.row.nickname }}</span>
            </el-form-item>
            <el-form-item label="代理ip：">
              <span>{{ props.row.ip }}</span>
            </el-form-item>
            <el-form-item label="代理端口：">
              <span>{{ props.row.port }}</span>
            </el-form-item>
            <el-form-item label="代理账号：">
              <span>{{ props.row.proxyUsername }}</span>
            </el-form-item>
            <el-form-item label="代理密码：">
              <span>{{ props.row.proxyPassword }}</span>
            </el-form-item>
            <el-form-item label="状态详情：">
              <span>{{ props.row.info }}</span>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column
        prop="num"
        label="序号"
        width="50"
      />
      <el-table-column
        prop="userid"
        label="账号"
        width="180"
        show-overflow-tooltip
      />
      <el-table-column
        prop="password"
        label="密码"
        width="180"
        show-overflow-tooltip
      />
      <el-table-column
        prop="deviceid"
        label="data"
        show-overflow-tooltip
      />
      <el-table-column
        prop="ip"
        label="代理"
        show-overflow-tooltip
      />
      <el-table-column
        prop="status"
        label="状态"
        :filters="[{ text: '未登录', value: undefined },{ text: '正常', value: '正常' },
                   { text: '异常', value: '异常' }, { text: '代理异常', value: '代理异常' },
                   { text: '登录中', value: '登录中' }]"
        :filter-method="filterTag"
        filter-placement="bottom-end"
        width="100"
      >
        <template slot-scope="scope">
          <el-popover trigger="hover" placement="top">
            <p>{{ scope.row.info === undefined ? '未登陆' : scope.row.info }}</p>
            <div slot="reference" class="name-wrapper">
              <el-tag
                v-if="scope.row.status === '正常'"
                type="success"
                disable-transitions
              >{{ scope.row.status }}</el-tag>
              <el-tag
                v-else-if="scope.row.status === '异常'"
                type="danger"
                disable-transitions
              >{{ scope.row.status }}</el-tag>
              <el-tag
                v-else-if="scope.row.status === '代理异常'"
                type="danger"
                disable-transitions
              >{{ scope.row.status }}</el-tag>
              <el-tag
                v-else-if="scope.row.status === '登录中'"
                disable-transitions
              >{{ scope.row.status }}</el-tag>
            </div>
          </el-popover>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

  </div>
</template>

<script>
import { loginAccount } from '@/api/account'
import { getAccountData, setAccountData, getProxyData, setProxyData, serverIp } from '@/api/global'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  components: { Pagination },
  data() {
    return {
      accountData: getAccountData().slice(0, 20),
      proxyData: getProxyData(),
      accountResult: '',
      multipleSelection: [],
      listLoading: false,
      loginDisabled: false,
      proxyChecked: false,
      proxyRadio: 'socks5',
      proxyDisabled: true,
      proxyNum: 0,
      uploadAccountUrl: serverIp + '/uploadAccount',
      uploadProxyUrl: serverIp + '/uploadProxy',
      total: getAccountData().length,
      listQuery: {
        page: 1,
        limit: 20
      }
    }
  },
  methods: {
    // 获取账号数据
    getList() {
      var start = (this.listQuery.page - 1) * this.listQuery.limit
      var end = this.listQuery.page * this.listQuery.limit
      this.accountData = getAccountData().slice(start, end)
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    uploadBefore() {
      this.listLoading = true
    },
    uploadSuccess(response) {
      if (response.result != null) {
        this.$message.error(response.result)
      } else {
        setAccountData(response.data)
        this.getList()
        this.total = getAccountData().length
        this.$message.success('上传账号信息成功，共有' + getAccountData().length + '条数据')
        this.accountAddProxy()
      }
      this.listLoading = false
    },
    uploadError() {
      this.$message.error('上传失败，请稍后重试')
      if (this.listLoading) {
        this.listLoading = false
      }
    },
    uploadProxySuccess(response) {
      if (response.result != null) {
        this.$message.error(response.result)
      } else {
        setProxyData(response.data)
        this.proxyData = getProxyData()
        this.$message.success('上传代理信息成功，共有' + this.proxyData.length + '条数据')
        this.proxyChecked = true
        this.proxyDisabled = false
        this.accountAddProxy()
      }
    },
    // 将代理信息加入到账号中
    accountAddProxy() {
      this.proxyNum = 0
      if (this.proxyData.length > 0 && this.accountData.length > 0) {
        this.accountData.forEach(account => {
          account.ip = this.proxyData[this.proxyNum].ip
          account.port = this.proxyData[this.proxyNum].port
          account.proxyUsername = this.proxyData[this.proxyNum].proxyUsername
          account.proxyPassword = this.proxyData[this.proxyNum].proxyPassword
          if (this.proxyNum >= this.proxyData.length - 1) {
            this.proxyNum = 0
          } else {
            this.proxyNum++
          }
        })
      }
    },
    // 登录选中账号
    loginSelection() {
      if (this.$refs.multipleTable.selection.length === 0) {
        this.$message.error('请勾选需要登录的账号')
        return
      }

      this.$refs.multipleTable.selection.forEach(data => {
        if (data.status === '登录中') {
          this.$message({
            showClose: true,
            message: '序号' + data.num + '的账号正在登录中，请勿重复登录',
            type: 'warning'
          })

          return true // break----用return false; continue --用return true;
        } else {
          data.status = '登录中'
          data.info = '登录中'
          this.$set(this.accountData, data.num - 1, data)
        }
        const request = { data: data, proxyChecked: this.proxyChecked }

        loginAccount(request).then(repData => {
          for (let index = 0; index < this.accountData.length; index++) {
            if (this.accountData[index].num === repData.data.num) {
              this.accountData[index].status = repData.data.status
              this.accountData[index].info = repData.data.info
              if (repData.data.username) {
                this.accountData[index].username = repData.data.username
              }
              if (repData.data.nickname) {
                this.accountData[index].nickname = repData.data.nickname
              }
              // 将返回的数据替换添加到原来的数据
              this.$set(this.accountData, repData.data.num - 1, this.accountData[index])
            }
          }
        }).catch(error => {
          this.$message.error(error)
        })
      })
    },

    filterTag(value, row) {
      return row.status === value
    },
    // 加群
    group() {
      const data = this.$refs.multipleTable.selection
      var flag = true

      if (data.length === 0) {
        this.$message.error('请勾选您需要加群的账号')
        return
      }

      data.forEach(userInfo => {
        if (userInfo.status.indexOf('异常') !== -1) {
          this.$message.error('加群不能包含登录异常的账号')
          flag = false
          return
        } else if (userInfo.status === undefined) {
          this.$message.error('加群不能包含未登录的账号')
          flag = false
          return
        }
      })

      if (flag) {
        // name params 为post方式 path query 为get方式
        // this.$router.push({ name: '加群', params: this.$refs.multipleTable.selection })
        var userids = []
        this.$refs.multipleTable.selection.forEach(userInfo => {
          userids.push(userInfo.userid)
        })
        if (this.proxyChecked) {
          this.$router.push({ name: '加群', params: { userids: userids, proxy: this.proxyData }})
        } else {
          this.$router.push({ name: '加群', params: { userids: userids }})
        }
      }
    },
    // 切换代理按钮是否改变
    proxyCheckedChange() {
      // 查看是否上传了代理
      if (this.proxyChecked) {
        if (this.proxyData.length === 0) {
          this.proxyChecked = false
          this.$message.error('请上传代理文件')
          return
        }
        this.proxyDisabled = false
      } else {
        this.proxyDisabled = true
      }
    },
    // 切换异常代理
    changeProxy() {
      if (this.$refs.multipleTable.selection.length === 0) {
        this.$message.error('请勾选需要切换代理的账号')
        return
      }
      this.$refs.multipleTable.selection.forEach(account => {
        account.ip = this.proxyData[this.proxyNum].ip
        account.port = this.proxyData[this.proxyNum].port
        account.proxyUsername = this.proxyData[this.proxyNum].proxyUsername
        account.proxyPassword = this.proxyData[this.proxyNum].proxyPassword
        this.$set(this.accountData, account.num - 1, account)
        if (this.proxyNum >= this.proxyData.length - 1) {
          this.proxyNum = 0
        } else {
          this.proxyNum++
        }
      })
    }
  }
}
</script>

