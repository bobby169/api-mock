<template>
  <a-drawer
    :width="700"
    title="项目设置"
    placement="right"
    :closable="true"
    :visible="currentValue"
    @close="onClose"
  >
    <a-tabs default-active-key="1">
      <a-tab-pane key="1" tab="基本设置">
        <Base @updated="updated" @deleted="deleted"></Base>
      </a-tab-pane>
      <a-tab-pane key="2" tab="成员列表">
        <Member></Member>
      </a-tab-pane>
    </a-tabs>
  </a-drawer>
</template>

<script>
  import Base from '@/views/components/setting/Base'
  import Member from '@/views/components/setting/Member'
  export default {
    name: 'Setting',
    components: {
      Base,
      Member
    },
    props: {
      value: {
        type: Boolean,
        default: false
      }
    },
    data () {
      return {
        currentValue: false
      }
    },
    watch: {
      currentValue (val) {
        this.$emit('input', val)
      },
      value (val) {
        this.currentValue = val
      }
    },
    methods: {
      onClose () {
        this.currentValue = false
      },
      updated () {
        this.$emit('updated')
        this.onClose()
      },
      deleted () {
        this.$emit('deleted')
        this.onClose()
      }
    },
    mounted () {
      if (this.value) {
        this.currentValue = true
      }
    }
  }
</script>

<style scoped>

</style>
