<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    :width="dialogWidth"
    :close-on-click-modal="false"
    top="6vh"
    @close="handleClose"
  >
    <div class="approval-form-dialog">
      <!-- 打印按钮（查看模式） -->
      <div v-if="mode === 'view'" class="print-toolbar">
        <el-button type="primary" plain @click="handlePrint">
          <el-icon><Printer /></el-icon>
          打印
        </el-button>
      </div>

      <!-- ============ 费用报销 ============ -->
      <div v-if="category === 'expense'" class="form-expense">
        <h2 class="voucher-title">费 用 报 销 凭 条</h2>
        <div class="voucher-info-row">
          <span>报销单编号：{{ showOrderNo }}</span>
          <span>打印时间：{{ printTime }}</span>
        </div>
        <el-descriptions :column="2" border size="small" class="voucher-table">
          <el-descriptions-item label="费用类型:">
            <el-input
              v-if="canEdit"
              v-model="form.expenseType"
              placeholder="请输入费用类型"
              size="small"
            />
            <span v-else>{{ form.expenseType || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="申 请 人:">
            <el-input
              v-if="canEdit"
              v-model="form.applicant"
              placeholder="请输入申请人"
              size="small"
            />
            <span v-else>{{ form.applicant || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="业务归属人:">
            <el-input
              v-if="canEdit"
              v-model="form.businessOwner"
              placeholder="请输入业务归属人"
              size="small"
            />
            <span v-else>{{ form.businessOwner || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="订单编号:">
            <el-input
              v-if="canEdit"
              v-model="form.orderNo"
              placeholder="请输入订单编号"
              size="small"
            />
            <span v-else>{{ form.orderNo || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="收款人/单位:">
            <el-input
              v-if="canEdit"
              v-model="form.payee"
              placeholder="请输入收款人/单位"
              size="small"
            />
            <span v-else>{{ form.payee || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="费用金额:">
            <el-input-number
              v-if="canEdit"
              v-model="form.amount"
              :min="0"
              :precision="2"
              :step="100"
              size="small"
              style="width: 100%;"
            />
            <span v-else class="highlight">{{ formatNumber(form.amount) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="报销银行:">
            <el-input
              v-if="canEdit"
              v-model="form.bankName"
              placeholder="请输入报销银行"
              size="small"
            />
            <span v-else>{{ form.bankName || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="大写金额:">
            <span class="chinese-amount">{{ chineseAmount }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="报销账号:">
            <el-input
              v-if="canEdit"
              v-model="form.accountNo"
              placeholder="请输入报销账号"
              size="small"
            />
            <span v-else>{{ form.accountNo || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="付款公司:">
            <el-input
              v-if="canEdit"
              v-model="form.payCompany"
              placeholder="请输入付款公司"
              size="small"
            />
            <span v-else>{{ form.payCompany || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="费用内容:">
            <el-input
              v-if="canEdit"
              v-model="form.content"
              type="textarea"
              :rows="2"
              placeholder="请输入费用内容"
              size="small"
            />
            <span v-else>{{ form.content || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="备    注:">
            <el-input
              v-if="canEdit"
              v-model="form.remark"
              type="textarea"
              :rows="2"
              placeholder="请输入备注"
              size="small"
            />
            <span v-else>{{ form.remark || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="请款抬头:">
            <el-input
              v-if="canEdit"
              v-model="form.title"
              placeholder="请输入请款抬头"
              size="small"
            />
            <span v-else>{{ form.title || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="币种类型:">
            <el-select
              v-if="canEdit"
              v-model="form.currencyType"
              placeholder="请选择币种"
              size="small"
              style="width: 100%;"
            >
              <el-option
                v-for="opt in currencyOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
            <span v-else>{{ form.currencyType || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="附件:" :span="2">
            <el-input
              v-if="canEdit"
              v-model="form.attachment"
              placeholder="请输入附件信息"
              size="small"
            />
            <span v-else>{{ form.attachment || '-' }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- ============ 货款 ============ -->
      <div v-else-if="category === 'goods_payment'" class="form-goods">
        <div class="two-col-layout">
          <div class="col-left">
            <div class="label-row">
              <span class="label">申请单号：</span>
              <el-input
                v-if="canEdit"
                v-model="form.applyNo"
                placeholder="自动生成"
                size="small"
                disabled
              />
              <span v-else class="value">{{ showOrderNo }}</span>
            </div>
            <div class="label-row">
              <span class="label">关联采购合同：</span>
              <el-input
                v-if="canEdit"
                v-model="form.relateOrderNo"
                placeholder="请输入关联采购合同/单号"
                size="small"
              />
              <span v-else class="value">{{ form.relateOrderNo || '-' }}</span>
            </div>
            <div class="label-row">
              <span class="label">报关合同号：</span>
              <el-input
                v-if="canEdit"
                v-model="form.customsNo"
                placeholder="请输入报关合同号"
                size="small"
              />
              <span v-else class="value">{{ form.customsNo || '-' }}</span>
            </div>
            <div class="label-row">
              <span class="label">支付方式：</span>
              <el-select
                v-if="canEdit"
                v-model="form.payMethod"
                placeholder="请选择支付方式"
                size="small"
                style="width: 100%;"
              >
                <el-option label="银行电汇" value="银行电汇" />
                <el-option label="承兑交单" value="承兑交单" />
                <el-option label="信用证" value="信用证" />
                <el-option label="现金" value="现金" />
              </el-select>
              <span v-else class="value">{{ form.payMethod || '-' }}</span>
            </div>
            <div class="label-row">
              <span class="label">收款公司(人)：</span>
              <el-input
                v-if="canEdit"
                v-model="form.payee"
                placeholder="请输入收款公司/人"
                size="small"
              />
              <span v-else class="value">{{ form.payee || '-' }}</span>
            </div>
            <div class="label-row">
              <span class="label">收款账号：</span>
              <el-input
                v-if="canEdit"
                v-model="form.payeeAccount"
                placeholder="请输入收款账号"
                size="small"
              />
              <span v-else class="value">{{ form.payeeAccount || '-' }}</span>
            </div>
            <div class="label-row">
              <span class="label">收款银行：</span>
              <el-input
                v-if="canEdit"
                v-model="form.payeeBank"
                placeholder="请输入收款银行"
                size="small"
              />
              <span v-else class="value">{{ form.payeeBank || '-' }}</span>
            </div>
            <div class="label-row">
              <span class="label">币种类型：</span>
              <el-select
                v-if="canEdit"
                v-model="form.currencyType"
                placeholder="请选择币种"
                size="small"
                style="width: 100%;"
              >
                <el-option
                  v-for="opt in currencyOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
              <span v-else class="value">{{ form.currencyType || '-' }}</span>
            </div>
            <div class="label-row">
              <span class="label">希望支付时间：</span>
              <el-date-picker
                v-if="canEdit"
                v-model="form.expectedPayTime"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择日期"
                size="small"
                style="width: 100%;"
              />
              <span v-else class="value">{{ form.expectedPayTime || '-' }}</span>
            </div>
            <div class="label-row">
              <span class="label">备注：</span>
              <el-input
                v-if="canEdit"
                v-model="form.remark"
                type="textarea"
                :rows="2"
                placeholder="请输入备注"
                size="small"
              />
              <span v-else class="value multi-line">{{ form.remark || '-' }}</span>
            </div>
            <div class="label-row">
              <span class="label">折合人民币：</span>
              <el-input-number
                v-if="canEdit"
                v-model="form.rmbAmount"
                :min="0"
                :precision="2"
                size="small"
                style="width: 100%;"
              />
              <span v-else class="value">{{ formatNumber(form.rmbAmount) }}</span>
            </div>
            <div class="label-row">
              <span class="label">汇率：</span>
              <el-input-number
                v-if="canEdit"
                v-model="form.rmbRate"
                :min="0"
                :precision="4"
                :step="0.01"
                size="small"
                style="width: 100%;"
              />
              <span v-else class="value">{{ form.rmbRate || '0.0000' }}</span>
            </div>
          </div>
          <div class="col-right">
            <div class="label-row">
              <span class="label">申请人：</span>
              <el-input
                v-if="canEdit"
                v-model="form.applicant"
                placeholder="请输入申请人"
                size="small"
              />
              <span v-else class="value">{{ form.applicant || '-' }}</span>
            </div>
            <div class="label-row">
              <span class="label">款项类型：</span>
              <el-input
                v-if="canEdit"
                v-model="form.paymentType"
                placeholder="如：运输费（内陆、出口、港杂）"
                size="small"
              />
              <span v-else class="value">{{ form.paymentType || '-' }}</span>
            </div>
            <div class="label-row">
              <span class="label">付款公司：</span>
              <el-input
                v-if="canEdit"
                v-model="form.payCompany"
                placeholder="请输入付款公司"
                size="small"
              />
              <span v-else class="value">{{ form.payCompany || '-' }}</span>
            </div>
            <div class="label-row">
              <span class="label">预付款：</span>
              <el-input-number
                v-if="canEdit"
                v-model="form.advance"
                :min="0"
                :precision="2"
                size="small"
                style="width: 100%;"
              />
              <span v-else class="value">{{ formatNumber(form.advance) }}</span>
            </div>
            <div class="label-row">
              <span class="label">中款：</span>
              <el-input-number
                v-if="canEdit"
                v-model="form.midPayment"
                :min="0"
                :precision="2"
                size="small"
                style="width: 100%;"
              />
              <span v-else class="value">{{ formatNumber(form.midPayment) }}</span>
            </div>
            <div class="label-row">
              <span class="label">尾款：</span>
              <el-input-number
                v-if="canEdit"
                v-model="form.tailPayment"
                :min="0"
                :precision="2"
                size="small"
                style="width: 100%;"
              />
              <span v-else class="value">{{ formatNumber(form.tailPayment) }}</span>
            </div>
            <div class="label-row">
              <span class="label">申请付款金额：</span>
              <el-input-number
                v-if="canEdit"
                v-model="form.applyAmount"
                :min="0"
                :precision="2"
                size="small"
                style="width: 100%;"
              />
              <span v-else class="value highlight">{{ formatNumber(form.applyAmount) }}</span>
            </div>
            <div class="label-row">
              <span class="label">大写金额：</span>
              <span class="chinese-amount value">{{ chineseAmount }}</span>
            </div>
            <div class="label-row">
              <span class="label">修改时间：</span>
              <span class="value">{{ form.modifyTime || nowStr }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ============ 销售订单 ============ -->
      <div v-else-if="category === 'sale_order'" class="form-common">
        <h3 class="sub-title">销售订单申请信息</h3>
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="订单编号">
            <span v-if="!canEdit">{{ showOrderNo }}</span>
            <el-input v-else v-model="form.saleOrderNo" placeholder="自动生成" size="small" disabled />
          </el-descriptions-item>
          <el-descriptions-item label="申请人">
            <el-input v-if="canEdit" v-model="form.applicant" placeholder="请输入申请人" size="small" />
            <span v-else>{{ form.applicant || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="客户名称">
            <el-input v-if="canEdit" v-model="form.customerName" placeholder="请输入客户名称" size="small" />
            <span v-else>{{ form.customerName || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="销售类型">
            <el-select v-if="canEdit" v-model="form.saleType" placeholder="请选择" size="small" style="width: 100%;">
              <el-option label="外销PI" value="外销PI" />
              <el-option label="内销订单" value="内销订单" />
              <el-option label="样品单" value="样品单" />
            </el-select>
            <span v-else>{{ form.saleType || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="产品概要" :span="2">
            <el-input v-if="canEdit" v-model="form.productSummary" type="textarea" :rows="2" placeholder="请输入产品概要" size="small" />
            <span v-else>{{ form.productSummary || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="订单总金额">
            <el-input-number v-if="canEdit" v-model="form.totalAmount" :min="0" :precision="2" size="small" style="width: 100%;" />
            <span v-else class="highlight">{{ formatNumber(form.totalAmount) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="大写金额">
            <span class="chinese-amount">{{ chineseAmount }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="币种">
            <el-select v-if="canEdit" v-model="form.currencyType" placeholder="请选择币种" size="small" style="width: 100%;">
              <el-option v-for="opt in currencyOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
            </el-select>
            <span v-else>{{ form.currencyType || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="付款条款">
            <el-input v-if="canEdit" v-model="form.payTerm" placeholder="如：信用证结算" size="small" />
            <span v-else>{{ form.payTerm || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="预计交货时间">
            <el-date-picker v-if="canEdit" v-model="form.expectDeliverTime" type="date" value-format="YYYY-MM-DD" size="small" style="width: 100%;" />
            <span v-else>{{ form.expectDeliverTime || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">
            <el-input v-if="canEdit" v-model="form.remark" type="textarea" :rows="2" size="small" />
            <span v-else>{{ form.remark || '-' }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- ============ 采购订单 ============ -->
      <div v-else-if="category === 'purchase_order'" class="form-common">
        <h3 class="sub-title">采购订单申请信息</h3>
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="采购订单号">
            <span v-if="!canEdit">{{ showOrderNo }}</span>
            <el-input v-else v-model="form.purchaseOrderNo" placeholder="自动生成" size="small" disabled />
          </el-descriptions-item>
          <el-descriptions-item label="申请人">
            <el-input v-if="canEdit" v-model="form.applicant" placeholder="请输入申请人" size="small" />
            <span v-else>{{ form.applicant || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="供应商名称">
            <el-input v-if="canEdit" v-model="form.supplier" placeholder="请输入供应商名称" size="small" />
            <span v-else>{{ form.supplier || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="入库仓库">
            <el-input v-if="canEdit" v-model="form.warehouse" placeholder="请输入仓库名称" size="small" />
            <span v-else>{{ form.warehouse || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="采购内容" :span="2">
            <el-input v-if="canEdit" v-model="form.productSummary" type="textarea" :rows="2" placeholder="请输入采购产品内容" size="small" />
            <span v-else>{{ form.productSummary || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="采购总金额">
            <el-input-number v-if="canEdit" v-model="form.totalAmount" :min="0" :precision="2" size="small" style="width: 100%;" />
            <span v-else class="highlight">{{ formatNumber(form.totalAmount) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="大写金额">
            <span class="chinese-amount">{{ chineseAmount }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="币种">
            <el-select v-if="canEdit" v-model="form.currencyType" placeholder="请选择币种" size="small" style="width: 100%;">
              <el-option v-for="opt in currencyOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
            </el-select>
            <span v-else>{{ form.currencyType || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="预计到货时间">
            <el-date-picker v-if="canEdit" v-model="form.expectReceiveTime" type="date" value-format="YYYY-MM-DD" size="small" style="width: 100%;" />
            <span v-else>{{ form.expectReceiveTime || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">
            <el-input v-if="canEdit" v-model="form.remark" type="textarea" :rows="2" size="small" />
            <span v-else>{{ form.remark || '-' }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- ============ 采购合同 ============ -->
      <div v-else-if="category === 'purchase_contract'" class="form-common">
        <h3 class="sub-title">采购合同申请信息</h3>
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="合同编号">
            <span v-if="!canEdit">{{ showOrderNo }}</span>
            <el-input v-else v-model="form.contractNo" placeholder="自动生成" size="small" disabled />
          </el-descriptions-item>
          <el-descriptions-item label="申请人">
            <el-input v-if="canEdit" v-model="form.applicant" placeholder="请输入申请人" size="small" />
            <span v-else>{{ form.applicant || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="供应商/对方">
            <el-input v-if="canEdit" v-model="form.supplier" placeholder="请输入供应商" size="small" />
            <span v-else>{{ form.supplier || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="关联单号">
            <el-input v-if="canEdit" v-model="form.relateNo" placeholder="请输入关联单号" size="small" />
            <span v-else>{{ form.relateNo || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="合同类型">
            <el-select v-if="canEdit" v-model="form.contractType" placeholder="请选择" size="small" style="width: 100%;">
              <el-option label="原材料采购" value="原材料采购" />
              <el-option label="成品采购" value="成品采购" />
              <el-option label="服务外包" value="服务外包" />
              <el-option label="物流运输" value="物流运输" />
            </el-select>
            <span v-else>{{ form.contractType || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="预计签署时间">
            <el-date-picker v-if="canEdit" v-model="form.expectedSignTime" type="date" value-format="YYYY-MM-DD" size="small" style="width: 100%;" />
            <span v-else>{{ form.expectedSignTime || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="合同总金额">
            <el-input-number v-if="canEdit" v-model="form.totalAmount" :min="0" :precision="2" size="small" style="width: 100%;" />
            <span v-else class="highlight">{{ formatNumber(form.totalAmount) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="大写金额">
            <span class="chinese-amount">{{ chineseAmount }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="币种">
            <el-select v-if="canEdit" v-model="form.currencyType" placeholder="请选择币种" size="small" style="width: 100%;">
              <el-option v-for="opt in currencyOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
            </el-select>
            <span v-else>{{ form.currencyType || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="付款条款">
            <el-input v-if="canEdit" v-model="form.payTerm" placeholder="如：30%预付，70%见提单" size="small" />
            <span v-else>{{ form.payTerm || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="交付条款" :span="2">
            <el-input v-if="canEdit" v-model="form.deliverTerm" type="textarea" :rows="2" size="small" />
            <span v-else>{{ form.deliverTerm || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">
            <el-input v-if="canEdit" v-model="form.remark" type="textarea" :rows="2" size="small" />
            <span v-else>{{ form.remark || '-' }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- ============ 退款 ============ -->
      <div v-else-if="category === 'refund'" class="form-common">
        <h3 class="sub-title">退款申请信息</h3>
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="退款单号">
            <span v-if="!canEdit">{{ showOrderNo }}</span>
            <el-input v-else v-model="form.refundNo" placeholder="自动生成" size="small" disabled />
          </el-descriptions-item>
          <el-descriptions-item label="申请人">
            <el-input v-if="canEdit" v-model="form.applicant" placeholder="请输入申请人" size="small" />
            <span v-else>{{ form.applicant || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="关联单号">
            <el-input v-if="canEdit" v-model="form.relateOrderNo" placeholder="请输入原订单号" size="small" />
            <span v-else>{{ form.relateOrderNo || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="退款类型">
            <el-select v-if="canEdit" v-model="form.refundType" placeholder="请选择" size="small" style="width: 100%;">
              <el-option label="多收货款退回" value="多收货款退回" />
              <el-option label="订单取消退款" value="订单取消退款" />
              <el-option label="客户退货退款" value="客户退货退款" />
              <el-option label="其他退款" value="其他退款" />
            </el-select>
            <span v-else>{{ form.refundType || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="客户名称">
            <el-input v-if="canEdit" v-model="form.customerName" placeholder="请输入客户名称" size="small" />
            <span v-else>{{ form.customerName || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="币种">
            <el-select v-if="canEdit" v-model="form.currencyType" placeholder="请选择币种" size="small" style="width: 100%;">
              <el-option v-for="opt in currencyOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
            </el-select>
            <span v-else>{{ form.currencyType || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="收款方/单位">
            <el-input v-if="canEdit" v-model="form.payee" placeholder="请输入收款方" size="small" />
            <span v-else>{{ form.payee || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="收款账号">
            <el-input v-if="canEdit" v-model="form.payeeAccount" placeholder="请输入收款账号" size="small" />
            <span v-else>{{ form.payeeAccount || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="收款银行">
            <el-input v-if="canEdit" v-model="form.payeeBank" placeholder="请输入收款银行" size="small" />
            <span v-else>{{ form.payeeBank || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="退款金额">
            <el-input-number v-if="canEdit" v-model="form.refundAmount" :min="0" :precision="2" size="small" style="width: 100%;" />
            <span v-else class="highlight">{{ formatNumber(form.refundAmount) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="大写金额" :span="2">
            <span class="chinese-amount">{{ chineseAmount }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="退款原因" :span="2">
            <el-input v-if="canEdit" v-model="form.reason" type="textarea" :rows="2" placeholder="请输入退款原因" size="small" />
            <span v-else>{{ form.reason || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">
            <el-input v-if="canEdit" v-model="form.remark" type="textarea" :rows="2" size="small" />
            <span v-else>{{ form.remark || '-' }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- ============ 工资 ============ -->
      <div v-else-if="category === 'salary'" class="form-common">
        <h3 class="sub-title">工资/提成发放申请信息</h3>
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="工资单号">
            <span v-if="!canEdit">{{ showOrderNo }}</span>
            <el-input v-else v-model="form.salaryNo" placeholder="自动生成" size="small" disabled />
          </el-descriptions-item>
          <el-descriptions-item label="申请人">
            <el-input v-if="canEdit" v-model="form.applicant" placeholder="请输入申请人" size="small" />
            <span v-else>{{ form.applicant || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="所属月份">
            <el-input v-if="canEdit" v-model="form.period" placeholder="如：2026年7月" size="small" />
            <span v-else>{{ form.period || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="发放部门">
            <el-input v-if="canEdit" v-model="form.dept" placeholder="请输入发放部门/全体员工" size="small" />
            <span v-else>{{ form.dept || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="员工人数">
            <el-input-number v-if="canEdit" v-model="form.employeeCount" :min="1" :precision="0" size="small" style="width: 100%;" />
            <span v-else>{{ form.employeeCount || 0 }} 人</span>
          </el-descriptions-item>
          <el-descriptions-item label="币种">
            <el-select v-if="canEdit" v-model="form.currencyType" placeholder="请选择币种" size="small" style="width: 100%;">
              <el-option v-for="opt in currencyOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
            </el-select>
            <span v-else>{{ form.currencyType || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="基本工资">
            <el-input-number v-if="canEdit" v-model="form.baseSalary" :min="0" :precision="2" size="small" style="width: 100%;" />
            <span v-else>{{ formatNumber(form.baseSalary) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="绩效工资">
            <el-input-number v-if="canEdit" v-model="form.performance" :min="0" :precision="2" size="small" style="width: 100%;" />
            <span v-else>{{ formatNumber(form.performance) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="奖金">
            <el-input-number v-if="canEdit" v-model="form.bonus" :min="0" :precision="2" size="small" style="width: 100%;" />
            <span v-else>{{ formatNumber(form.bonus) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="各类补贴">
            <el-input-number v-if="canEdit" v-model="form.allowance" :min="0" :precision="2" size="small" style="width: 100%;" />
            <span v-else>{{ formatNumber(form.allowance) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="发放总金额">
            <span class="highlight">{{ formatNumber(form.totalAmount || totalSalary) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="大写金额">
            <span class="chinese-amount">{{ chineseAmount }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="预计发放时间">
            <el-date-picker v-if="canEdit" v-model="form.expectedPayTime" type="date" value-format="YYYY-MM-DD" size="small" style="width: 100%;" />
            <span v-else>{{ form.expectedPayTime || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">
            <el-input v-if="canEdit" v-model="form.remark" type="textarea" :rows="2" size="small" />
            <span v-else>{{ form.remark || '-' }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- ============ 审批历史记录（所有分类底部） ============ -->
      <div v-if="mode === 'view'" class="approval-history">
        <h3 class="history-title">审批记录</h3>
        <el-table :data="steps" border size="small" class="history-table">
          <el-table-column prop="time" label="审批时间" align="center" />
          <el-table-column prop="approver" label="审批人" align="center" width="120" />
          <el-table-column prop="result" label="审批结果" align="center" width="120">
            <template #default="{ row }">
              <el-tag
                v-if="row.result !== '-'"
                :type="resultTagTypeMap[row.result]"
                effect="light"
                size="small"
              >
                {{ row.result }}
              </el-tag>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="opinion" label="审批意见">
            <template #default="{ row }">
              <span>{{ row.opinion === '-' ? '-' : row.opinion }}</span>
            </template>
          </el-table-column>
        </el-table>

        <div class="cancel-reason">
          <span class="label">作废原因：</span>
          <span>{{ lastRejectReason || '无' }}</span>
        </div>

        <div class="flow-link">
          {{ categoryFlowLabel }}审批流程图
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">
        {{ mode === 'view' ? '关闭' : '取消' }}
      </el-button>
      <el-button
        v-if="canEdit"
        type="primary"
        :loading="submitting"
        @click="handleSubmit"
      >
        {{ mode === 'add' ? '保存并发起' : '保存修改' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import type { FormInstance } from 'element-plus'
import { Printer } from '@element-plus/icons-vue'
import {
  addApproval,
  updateApproval,
  getCategoryLabel,
  getApprovalById,
  currencyOptions,
  resultTagTypeMap,
  numberToChinese,
  type ApprovalCategory,
  type ApprovalList,
  type ApprovalAddForm,
  type ApprovalStepRecord,
} from '@/mock/approvalList'

interface Props {
  modelValue: boolean
  mode: 'add' | 'edit' | 'view'
  category: ApprovalCategory
  record?: ApprovalList | null
}

const props = withDefaults(defineProps<Props>(), {
  record: null,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const formRef = ref<FormInstance>()
const submitting = ref(false)
const detailRecord = ref<ApprovalList | null>(props.record)

// 表单字段 — 统一容器，按分类条件渲染
const form = ref<Record<string, any>>({})

// ========== 计算属性 ==========

const canEdit = computed(() => props.mode === 'add' || props.mode === 'edit')

const dialogTitle = computed(() => {
  const catLabel = getCategoryLabel(props.category)
  if (props.mode === 'add') return `新增${catLabel}审批`
  if (props.mode === 'edit') return `编辑${catLabel}审批`
  return `${catLabel}审批详情`
})

const dialogWidth = computed(() => {
  if (props.category === 'goods_payment') return '1200px'
  return props.mode === 'view' ? '980px' : '880px'
})

const showOrderNo = computed(() => detailRecord.value?.orderNo || form.value.applyNo || form.value.refundNo || form.value.salaryNo || form.value.purchaseOrderNo || form.value.contractNo || form.value.saleOrderNo || '（保存后生成）')

const printTime = computed(() =>
  new Date().toISOString().slice(0, 10).replace(/-/g, '-')
)

const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ')

// 用于大写金额计算的主金额
const primaryAmount = computed(() => {
  const f = form.value
  return Number(
    f.amount ||
    f.applyAmount ||
    f.totalAmount ||
    f.refundAmount ||
    (f.baseSalary || 0) + (f.performance || 0) + (f.bonus || 0) + (f.allowance || 0) ||
    0
  )
})

const chineseAmount = computed(() => numberToChinese(primaryAmount.value))

const totalSalary = computed(() =>
  Number(form.value.baseSalary || 0) +
  Number(form.value.performance || 0) +
  Number(form.value.bonus || 0) +
  Number(form.value.allowance || 0)
)

const steps = computed<ApprovalStepRecord[]>(() => {
  const s = detailRecord.value?.steps || []
  if (s.length === 0) {
    return [{ time: '-', approver: '-', result: '-', opinion: '-' }]
  }
  return s
})

const lastRejectReason = computed(() => {
  const s = [...(detailRecord.value?.steps || [])]
  s.reverse()
  const rejectStep = s.find((st) => st.result === '驳回' || st.result === '返回上一级')
  return rejectStep?.opinion || ''
})

const categoryFlowLabel = computed(() => {
  const labelMap: Record<ApprovalCategory, string> = {
    expense: '费用报销单',
    goods_payment: '货款申请单',
    sale_order: '销售订单',
    purchase_order: '采购订单',
    purchase_contract: '采购合同',
    refund: '退款申请单',
    salary: '工资发放单',
  }
  return labelMap[props.category] || getCategoryLabel(props.category)
})

// ========== 方法 ==========

const formatNumber = (n: any) => {
  const num = Number(n) || 0
  return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// 根据分类初始化默认表单
const getDefaultForm = (cat: ApprovalCategory): Record<string, any> => {
  const base: Record<string, any> = {
    applicant: '',
    currencyType: '人民币',
    remark: '',
  }
  if (cat === 'expense') {
    return { ...base, expenseType: '', businessOwner: '', orderNo: '', payee: '', amount: 0, bankName: '', accountNo: '', content: '', title: '', payCompany: '', attachment: '' }
  }
  if (cat === 'goods_payment') {
    return { ...base, applyNo: '', relateOrderNo: '', customsNo: '', payMethod: '银行电汇', payee: '', payeeAccount: '', payeeBank: '', expectedPayTime: '', advance: 0, midPayment: 0, tailPayment: 0, applyAmount: 0, paymentType: '', payCompany: '', modifyTime: nowStr, rmbAmount: 0, rmbRate: 0 }
  }
  if (cat === 'sale_order') {
    return { ...base, saleOrderNo: '', customerName: '', saleType: '外销PI', productSummary: '', totalAmount: 0, payTerm: '', expectDeliverTime: '' }
  }
  if (cat === 'purchase_order') {
    return { ...base, purchaseOrderNo: '', supplier: '', warehouse: '', productSummary: '', totalAmount: 0, expectReceiveTime: '' }
  }
  if (cat === 'purchase_contract') {
    return { ...base, contractNo: '', supplier: '', relateNo: '', contractType: '原材料采购', payTerm: '', deliverTerm: '', totalAmount: 0, expectedSignTime: '' }
  }
  if (cat === 'refund') {
    return { ...base, refundNo: '', relateOrderNo: '', refundType: '多收货款退回', customerName: '', payee: '', payeeAccount: '', payeeBank: '', refundAmount: 0, reason: '' }
  }
  if (cat === 'salary') {
    return { ...base, salaryNo: '', period: '', dept: '', employeeCount: 1, baseSalary: 0, performance: 0, bonus: 0, allowance: 0, expectedPayTime: '' }
  }
  return base
}

// 打开时初始化
watch(
  () => props.modelValue,
  async (val) => {
    if (!val) return
    if (props.mode === 'add') {
      form.value = getDefaultForm(props.category)
      detailRecord.value = null
    } else if (props.record?.id) {
      try {
        const res = await getApprovalById(props.record.id)
        detailRecord.value = res.data
        form.value = { ...(res.data.formData || {}) }
      } catch (err) {
        console.error(err)
        form.value = getDefaultForm(props.category)
      }
    } else {
      form.value = getDefaultForm(props.category)
    }
  }
)

const handleClose = () => {
  visible.value = false
  formRef.value?.resetFields()
}

const validateForm = (): string | null => {
  const f = form.value
  if (!f.applicant || !String(f.applicant).trim()) return '请填写申请人'
  if (props.category === 'expense') {
    if (!f.payee || !String(f.payee).trim()) return '请填写收款人/单位'
    if (!f.amount || Number(f.amount) <= 0) return '请填写费用金额'
  }
  if (props.category === 'goods_payment') {
    if (!f.payee || !String(f.payee).trim()) return '请填写收款公司/人'
    if (!f.applyAmount || Number(f.applyAmount) <= 0) return '请填写申请付款金额'
  }
  if (props.category === 'sale_order') {
    if (!f.customerName || !String(f.customerName).trim()) return '请填写客户名称'
    if (!f.totalAmount || Number(f.totalAmount) <= 0) return '请填写订单总金额'
  }
  if (props.category === 'purchase_order') {
    if (!f.supplier || !String(f.supplier).trim()) return '请填写供应商名称'
    if (!f.totalAmount || Number(f.totalAmount) <= 0) return '请填写采购总金额'
  }
  if (props.category === 'purchase_contract') {
    if (!f.supplier || !String(f.supplier).trim()) return '请填写供应商'
    if (!f.totalAmount || Number(f.totalAmount) <= 0) return '请填写合同总金额'
  }
  if (props.category === 'refund') {
    if (!f.payee || !String(f.payee).trim()) return '请填写收款方/单位'
    if (!f.refundAmount || Number(f.refundAmount) <= 0) return '请填写退款金额'
    if (!f.reason || !String(f.reason).trim()) return '请填写退款原因'
  }
  if (props.category === 'salary') {
    if (!f.period || !String(f.period).trim()) return '请填写所属月份'
    if (!f.dept || !String(f.dept).trim()) return '请填写发放部门'
    const total = totalSalary.value
    if (total <= 0) return '发放总金额必须大于0'
  }
  return null
}

const handleSubmit = async () => {
  const err = validateForm()
  if (err) {
    ElMessage.warning(err)
    return
  }
  submitting.value = true
  try {
    // 工资类自动计算totalAmount
    if (props.category === 'salary') {
      form.value.totalAmount = totalSalary.value
    }
    const payload: ApprovalAddForm = {
      category: props.category,
      formData: { ...form.value },
    }
    if (props.mode === 'add') {
      await addApproval(payload)
      ElMessage.success('新增并发起审批成功')
    } else if (props.mode === 'edit' && detailRecord.value) {
      await updateApproval(detailRecord.value.id, payload)
      ElMessage.success('修改保存成功')
    }
    emit('success')
    handleClose()
  } catch (err: any) {
    console.error(err)
    ElMessage.error(err.message || '保存失败')
  } finally {
    submitting.value = false
  }
}

const handlePrint = () => {
  ElMessage.info('打印功能触发（演示环境）')
}
</script>

<style scoped lang="scss">
.approval-form-dialog {
  .print-toolbar {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 12px;
  }

  .sub-title {
    margin: 8px 0 16px;
    padding-left: 10px;
    border-left: 4px solid #409eff;
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }

  .highlight {
    color: #f56c6c;
    font-weight: 700;
    font-size: 15px;
  }

  .chinese-amount {
    color: #e6a23c;
    font-weight: 600;
  }

  /* 费用报销凭条样式 */
  .form-expense {
    .voucher-title {
      text-align: center;
      font-size: 22px;
      font-weight: 700;
      margin-bottom: 8px;
      letter-spacing: 8px;
      color: #303133;
    }
    .voucher-info-row {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      color: #606266;
      margin-bottom: 12px;
      padding: 0 4px;
    }
    .voucher-table {
      :deep(.el-descriptions__label) {
        width: 110px;
        background: #fafafa;
      }
    }
  }

  /* 货款：两列布局 */
  .form-goods {
    .two-col-layout {
      display: flex;
      gap: 24px;
      padding: 8px;

      .col-left, .col-right {
        flex: 1;
      }

      .label-row {
        display: flex;
        align-items: flex-start;
        padding: 7px 0;
        border-bottom: 1px dashed #ebeef5;

        .label {
          flex-shrink: 0;
          width: 100px;
          color: #909399;
          font-size: 13px;
          padding-right: 8px;
          line-height: 32px;
        }

        .value {
          flex: 1;
          line-height: 32px;
          color: #303133;
          word-break: break-all;

          &.highlight {
            color: #f56c6c;
            font-weight: 700;
            font-size: 15px;
          }

          &.multi-line {
            line-height: 1.6;
            white-space: pre-wrap;
          }

          &.chinese-amount {
            color: #e6a23c;
            font-weight: 600;
          }
        }

        :deep(.el-input),
        :deep(.el-select),
        :deep(.el-date-editor),
        :deep(.el-input-number) {
          flex: 1;
        }
      }
    }
  }

  /* 通用分类表单 */
  .form-common {
    :deep(.el-descriptions__label) {
      width: 110px;
      background: #fafafa;
      font-weight: 500;
    }
  }

  /* 审批历史 */
  .approval-history {
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid #ebeef5;

    .history-title {
      font-size: 16px;
      font-weight: 600;
      color: #f56c6c;
      margin: 0 0 12px;
    }

    .history-table {
      margin-bottom: 12px;
    }

    .cancel-reason {
      margin: 10px 0 8px;
      color: #f56c6c;
      font-size: 13px;

      .label {
        font-weight: 600;
      }
    }

    .flow-link {
      margin-top: 6px;
      font-size: 13px;
      color: #409eff;
      cursor: pointer;
    }
  }
}
</style>
