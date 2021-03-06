<template>
  <div class="page-mock">
    <div class="mock-header">
      <a-row type="flex" justify="space-between">
        <a-col class="left">
          <a-icon style="font-size: 20px; margin-right: 5px;" type="book"/>
          <a style="font-size: 20px">moon</a>
          <span style="font-size: 16px; margin: 0 5px">/</span>
          <a-dropdown v-if="project" :trigger="['click']">
            <a class="ant-dropdown-link" @click="onProjectDropdown" style="font-size: 20px">
              {{ project.name }} <a-icon type="down" />
            </a>
            <a-menu slot="overlay">
              <a-menu-item :disabled="true">
                <a-input-search v-model="projectSearch" placeholder="input search text" style="width: 200px" @search="onProjectSearch"/>
                <a-button @click="toProjectList" style="margin-left: 10px" icon="form" ></a-button>
              </a-menu-item>
              <a-menu-item :disabled="true">
                项目列表
              </a-menu-item>
              <a-menu-divider />
              <a-menu-item v-for="(item, index) in projectList" :key="index">
                <div @click="replaceProject(item)">{{ item.name }}</div>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
          <a
            class="min-btn"
            v-if="baseURL"
            v-clipboard:copy="baseURL"
            v-clipboard:success="onCopySuccess"
            v-clipboard:error="onCopyError"><a-icon type="link"></a-icon> Base URL</a>
          <a class="min-btn"><a-icon type="import"></a-icon> 导入</a>
          <a class="min-btn"><a-icon type="export"></a-icon> 导出</a>
        </a-col>
        <a-col class="right">
          <a-button class="interaction" icon="control" @click="showHistory=true">动态</a-button>
          <a-button class="setting" icon="setting" @click="showSetting=true">设置</a-button>
        </a-col>
      </a-row>
    </div>
    <a-card :bordered="false" :bodyStyle="{ padding: '0', height: '100%' }" :style="{ height: '100%' }">
      <Multipane layout="vertical" class="mock-main" @paneResizeStop="paneResizeStop">
        <div class="mock-left" ref="mockLeft" :style="{width:mockLeftWidth}">
          <div class="content">
            <a-row type="flex" :gutter="5">
              <a-col style="flex: 1">
                <a-input-search placeholder="Search" @change="onChangeCategory" @search="onSearchCategory" />
              </a-col>
              <a-col>
                <a-button type="primary" @click="createOrUpdateCategory" icon="plus">分类</a-button>
              </a-col>
            </a-row>
            <a-tree
              v-if="categoryTree.length"
              class="mock-tree"
              show-icon
              draggable
              :auto-expand-parent="autoExpandParent"
              :blockNode="true"
              :expanded-keys.sync="expandedKeys"
              :selected-keys.sync="selectedKeys"
              @drop="onDrop"
              :tree-data="categoryTree">
              <a-icon slot="star" type="star" theme="filled" style="color: #808080" />
              <a-icon slot="appstore" type="appstore" theme="filled" style="color: #808080" />
              <a-icon slot="folder" type="folder" theme="filled" style="color: #808080" />
              <template slot="parent" slot-scope="item">
                <span class="tree-parent-item" @click="toList(item)" @mouseover="mouseover(item)" @mouseout="mouseout(item)">
                  <strong>{{ item.title }}</strong>
                  <a-button-group v-show="item.showRightButton" size="small">
                    <a-tooltip title="添加接口">
                      <a-button @click.stop="addApi(item.dataRef.id)" icon="plus"></a-button>
                    </a-tooltip>
                    <a-tooltip title="修改分类">
                      <a-button @click.stop="createOrUpdateCategory(item.dataRef)" icon="edit"></a-button>
                    </a-tooltip>
                    <a-tooltip title="删除分类">
                      <a-button @click.stop="deleteCategory(item.dataRef.id, item)" icon="delete"></a-button>
                    </a-tooltip>
                  </a-button-group>
                </span>
              </template>
              <template slot="child" slot-scope="item">
                <span class="tree-child-item" @click="toDetail(item)" @mouseover="mouseover(item)" @mouseout="mouseout(item)">
                  <strong :style="{color: methodTagColor(item.dataRef.method)}">{{ methodToString(item.dataRef.method) }}</strong>
                  <span v-if="item.dataRef.url.match(searchValue) && item.dataRef.url.match(searchValue)[0]">
                    <span style="color: #f50">{{ item.dataRef.url }}</span>
                  </span>
                  <span v-else>{{ item.dataRef.url }}</span>
                  <em v-show="item.showRightButton">
                    <a-button-group size="small">
                      <a-tooltip title="复制接口">
                        <a-button @click.stop="copyApi(item.dataRef.id)" icon="copy"></a-button>
                      </a-tooltip>
                      <a-popconfirm
                        trigger="click"
                        title="确定删除吗?"
                        @visibleChange="(visible)=> {if(!visible) {mouseEnable=true; item.dataRef.showRightButton=false} }"
                        @cancel.stop="() => {mouseEnable=true; item.dataRef.showRightButton=false }"
                        @confirm.stop="deleteApi(item.dataRef.id, item)"
                      >
                        <a-button @click.stop="() => {mouseEnable=false}" icon="delete"></a-button>
                      </a-popconfirm>
                    </a-button-group>
                  </em>
                </span>
              </template>
            </a-tree>
          </div>
        </div>
        <MultipaneResizer></MultipaneResizer>
        <div class="mock-right"><route-view></route-view></div>
      </Multipane>
      <a-modal
        :title="modalCreateOrUpdateCategory.title"
        :width="400"
        :visible="modalCreateOrUpdateCategory.show"
        @ok="createOrUpdateCategoryOk"
        @cancel="createOrUpdateCategoryCancel"
      >
        <a-form-model
          :model="formCategory"
          ref="formCategory"
          :label-col="modalCreateOrUpdateCategory.labelCol"
          :wrapper-col="modalCreateOrUpdateCategory.wrapperCol"
          :rules="modalCreateOrUpdateCategory.rules"
        >
          <a-form-model-item label="分类名" prop="name">
            <a-input v-model="formCategory.name" placeholder="分类名称"/>
          </a-form-model-item>
          <a-form-model-item label="备注" prop="description">
            <a-input v-model="formCategory.description" placeholder="备注" />
          </a-form-model-item>
        </a-form-model>
      </a-modal>
      <CreateMockDialog :categoryId="categoryId" v-model="showCreateMockDialog" @success="getCategoryList"></CreateMockDialog>
      <Setting v-model="showSetting" @updated="getProject"></Setting>
      <History v-model="showHistory"></History>
    </a-card>
  </div>
</template>

<script>
  import { Multipane, MultipaneResizer } from '@/views/components/vue-multipane'
  import { Tree } from 'ant-design-vue'
  import ApiCategory from '@/api/category'
  import { RouteView } from '@/layouts'
  import { MethodTagColor, Method, KeyAll, KeyStar } from '@/utils/enum'
  import CreateMockDialog from '@/views/components/CreateMockDialog'
  import Vue from 'vue'
  import { mapState, mapMutations, mapActions } from 'vuex'
  import { MOCK_LEFT_WIDTH } from '@/store/mutation-types'
  import ApiProject from '@/api/project'
  import ApiMock from '@/api/mock'
  import Setting from '@/views/components/setting/Index'
  import History from '@/views/components/History'

  const getParentKey = (key, tree) => {
    let parentKey
    for (let i = 0; i < tree.length; i++) {
      const node = tree[i]
      if (node.children) {
        if (node.children.some(item => item.key === key)) {
          parentKey = node.key
        } else if (getParentKey(key, node.children)) {
          parentKey = getParentKey(key, node.children)
        }
      }
    }
    return parentKey
  }

  export default {
    components: {
      Multipane,
      MultipaneResizer,
      RouteView,
      CreateMockDialog,
      'a-tree': Tree,
      Setting,
      History
    },
    data () {
      return {
        showSetting: false,
        showHistory: false,
        projectList: [],
        projectSearch: '',
        mockLeftWidth: Vue.ls.get(MOCK_LEFT_WIDTH) || '300px',
        showCreateMockDialog: false,
        modalCreateOrUpdateCategory: {
          show: false,
          title: '',
          labelCol: { span: 6 },
          wrapperCol: { span: 18 },
          rules: {
            name: [
              { required: true, message: '请输入分类名', trigger: 'blur' }
            ]
          }
        },
        formCategory: {
          name: '',
          description: ''
        },
        mouseEnable: true,
        categoryId: '',
        autoExpandParent: true,
        searchValue: '',
        expandedKeys: [this.$route.params.categoryId],
        selectedKeys: this.$route.params.categoryId === 'all' ? [KeyAll] : this.$route.params.mockId ? [`${this.$route.params.categoryId}-${this.$route.params.mockId}`] : [this.$route.params.categoryId]
      }
    },
    computed: {
      ...mapState('mock', ['projectId', 'categoryTree', 'categoryTreeFlat', 'project', 'baseURL'])
    },
    methods: {
      ...mapMutations('mock', ['SET_PROJECT_ID', 'SET_CATEGORY_ID', 'SET_MOCK_ID']),
      ...mapActions('mock', ['getCategoryList', 'getProject']),
      paneResizeStop (pane, container, size) {
        Vue.ls.set(MOCK_LEFT_WIDTH, size)
      },
      async getProjectList (params) {
        const { data } = await ApiProject.list(params)
        const { bean, code } = data
        if (code === 200) {
          this.projectList = bean.data
        }
      },
      onProjectDropdown (e) {
        e.preventDefault()
        this.projectSearch = ''
        this.getProjectList()
      },
      onProjectSearch (value) {
        this.getProjectList({ keywords: value })
      },
      toProjectList () {
        this.$router.push({ name: 'project' })
      },
      replaceProject (item) {
        location.href = `${location.origin}/project/${item.id}/all`
      },
      methodToString (num) {
        return Method[num].toUpperCase()
      },
      methodTagColor (num) {
        return MethodTagColor[num]
      },
      mouseover (e) {
        if (![KeyAll, KeyStar].includes(e.eventKey) && this.mouseEnable) {
          e.dataRef.showRightButton = true
        }
      },
      mouseout (e) {
        if (this.mouseEnable) {
          e.dataRef.showRightButton = false
        }
      },
      onChangeCategory (e) {
        const value = e.target.value
        const expandedKeys = this.categoryTreeFlat
          .map(item => {
            if (item.title.indexOf(value) > -1) {
              return getParentKey(item.key, this.categoryTree)
            }
            return null
          })
          .filter((item, i, self) => item && self.indexOf(item) === i)
        Object.assign(this, {
          expandedKeys,
          searchValue: value,
          autoExpandParent: true
        })
      },
      onSearchCategory (value) {
        this.getCategoryList(value)
      },
      createOrUpdateCategory (record) {
        if (record && record.id) {
          this.formCategory.id = record.id
          this.formCategory.name = record.name
          this.formCategory.description = record.description
          this.modalCreateOrUpdateCategory.title = '修改分类'
        } else {
          this.formCategory.id = ''
          this.formCategory.name = ''
          this.formCategory.description = ''
          this.modalCreateOrUpdateCategory.title = '添加分类'
        }
        this.modalCreateOrUpdateCategory.show = true
      },
      createOrUpdateCategoryOk () {
        this.$refs.formCategory.validate(async valid => {
            if (!valid) {
              console.log('error submit!!')
              return false
            }

            if (this.formCategory.id) {
              const { data } = await ApiCategory.update({ ...this.formCategory, project_id: this.projectId })
              const { code, message } = data
              if (code === 200) {
                this.getCategoryList()
                this.$message.success('更新成功')
              } else {
                this.$message.error(message)
              }
            } else {
              const { data } = await ApiCategory.create({ ...this.formCategory, project_id: this.projectId })
              const { code, message } = data
              if (code === 200) {
                this.getCategoryList()
                this.$message.success('创建成功')
              } else {
                this.$message.error(message)
              }
            }

            this.modalCreateOrUpdateCategory.show = false
          }
        )
      },
      createOrUpdateCategoryCancel () {
        this.modalCreateOrUpdateCategory.show = false
      },
      async deleteCategory (id, record) {
        const that = this
        this.$confirm({
          title: `确定要删除分类：${record.title} 吗?`,
          content: '分类一旦被删除不可恢复，并且会删除其中所有的接口！',
          async onOk () {
            const { data } = await ApiCategory.delete({ id })
            const { code } = data
            if (code === 200) {
              await that.getCategoryList()
              that.toList({ eventKey: KeyAll }, true)
            } else {
              that.$message.error('删除分类失败')
            }
          },
          onCancel () {
            console.log('Cancel')
          }
        })
      },
      addApi (id) {
        this.categoryId = id
        this.showCreateMockDialog = true
      },
      async copyApi (id) {
        const { data } = await ApiMock.copy({ id })
        const { code, bean } = data
        if (code === 200) {
          await this.getCategoryList()
          this.toDetail({ parentId: bean.category_id, id: bean.id })
        } else {
          this.$message.error('复制接口失败')
        }
      },
      async deleteApi (id, item) {
        const { data } = await ApiMock.delete({ id })
        const { code } = data
        if (code === 200) {
          await this.getCategoryList()
          this.toList({ id: item.category_id }, true)
        } else {
          this.$message.error('删除接口失败')
        }
      },
      toList (item, refresh = false) {
        let categoryId = item.id
        if ([KeyAll, KeyStar].includes(item.eventKey)) {
          categoryId = item.eventKey
        }
        if (refresh) {
          this.$router.push({ name: 'mockList', params: { categoryId }, query: { refresh: new Date().getTime() } })
        } else {
          this.$router.push({ name: 'mockList', params: { categoryId } })
        }
      },
      toDetail (item) {
        let categoryId = item.parentId
        if ([KeyAll, KeyStar].includes(item.eventKey)) {
          categoryId = item.eventKey
        }
        this.SET_MOCK_ID(item.id)
        this.$router.push({ name: 'mockDetail', params: { categoryId, mockId: item.id } })
      },
      onCopySuccess (e) {
        this.$message.success('You just copied: ' + e.text)
      },
      onCopyError (e) {
        this.$message.error('Failed to copy texts')
      },
      async updateMock (updateObj) {
        const { data } = await ApiMock.update(updateObj)
        const { code, message } = data
        if (code === 200) {
          this.getCategoryList()
        } else {
          this.$message.error(message)
        }
      },
      onDrop (info) {
        const dropKey = info.node.eventKey
        const dragKey = info.dragNode.eventKey
        const dropPos = info.node.pos.split('-')
        const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1])
        const dropArr = dropKey.split('-')
        const dragArr = dragKey.split('-')
        const dragId = dragArr[dragArr.length - 1]
        const dropId = Number(dropArr[0])
        const loop = (data, key, callback) => {
          data.forEach((item, index, arr) => {
            if (item.key === key) {
              return callback(item, index, arr)
            }
            if (item.children) {
              return loop(item.children, key, callback)
            }
          })
        }
        const data = [...this.categoryTree]
        if (isNaN(dropId) || (!info.dropToGap && /-/g.test(dropKey))) return
        // Find dragObject
        let dragObj
        loop(data, dragKey, (item, index, arr) => {
          arr.splice(index, 1)
          dragObj = item
        })
        if (!info.dropToGap) {
          // Drop on the content
          loop(data, dropKey, item => {
            item.children = item.children || []
            // where to insert
            item.children.push(dragObj)
          })
        } else if (
          (info.node.children || []).length > 0 && // Has children
          info.node.expanded && // Is expanded
          dropPosition === 1 // On the bottom gap
        ) {
          loop(data, dropKey, item => {
            item.children = item.children || []
            // where to insert
            item.children.unshift(dragObj)
          })
        } else {
          let ar
          let i
          loop(data, dropKey, (item, index, arr) => {
            ar = arr
            i = index
          })
          if (dropPosition === -1) {
            ar.splice(i, 0, dragObj)
          } else {
            ar.splice(i + 1, 0, dragObj)
          }
        }
       this.updateMock({ id: dragId, category_id: dropId })
      }
    },
    beforeRouteUpdate (to, from, next) {
      const { projectId, categoryId, mockId } = to.params
      this.SET_PROJECT_ID(projectId)
      this.SET_CATEGORY_ID(categoryId)
      this.expandedKeys.splice(0, this.expandedKeys.length)
      this.expandedKeys.push(String(categoryId))
      setTimeout(() => {
        this.selectedKeys = categoryId === 'all' ? [KeyAll] : mockId ? [`${categoryId}-${mockId}`] : [categoryId]
      }, 500)
      next()
    },
    created () {
      const { projectId, categoryId } = this.$route.params
      this.SET_PROJECT_ID(projectId)
      this.SET_CATEGORY_ID(categoryId)
      this.getProject()
      this.getCategoryList()
      this.getProjectList()
    }
  }
</script>

<style lang="less">
  .page-mock{
    .mock-header{
      height: 60px;
      line-height: 60px;
      padding: 0 20px;

      .left{
        .min-btn{
          margin-left: 20px;
        }
      }

      .right{
        button{
          margin-left: 20px;
        }
      }
    }

    .mock-main{
      width: 100%;
      display: flex;
      height: 100%;
      overflow: auto;

      .multipane-resizer {
        height: auto;
        &:before{
          display: block;
          content: "";
          width: 3px;
          height: 40px;
          position: absolute;
          top: 50%;
          left: 50%;
          margin-top: -20px;
          margin-left: -4.5px;
          border-left: 1px solid #ccc;
          border-right: 1px solid #ccc;
        }
      }

      .mock-left{
        min-width: 200px;
        width: 300px;
        max-width: 500px;
        margin-right: 5px;
        background: #f3f3f3;
        border: 1px solid #dadada;
        display: flex;
        .content{
          flex: 1;
          padding: 5px;
          overflow: hidden;
        }
        .mock-tree{
          margin-left: 10px;
          li{
            .ant-tree-node-content-wrapper{
              height: 30px;
              line-height:26px;
            }
            .ant-tree-node-content-wrapper:not(.ant-tree-node-selected):hover{
              background: #e8e8e8;
            }
            position: relative;
          }
          .tree-parent-item{
            position: absolute;
            display: inline-flex;
            width: calc(100% - 58px);
            strong{
              font-weight: normal;
              flex: 1;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
            }
          }
          .tree-child-item {
            display: flex;
            strong{
              margin-right: 10px;
              font-size: 12px;
            }
            span{
              flex: 1;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
            }
            em{
            }
          }
        }
      }

      .mock-right{
        flex: 1;
      }
    }
  }
</style>
