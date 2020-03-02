import React from 'react'
import { getBrands, createBrand, updateBrand, deleteBrand, searchBrand } from 'ducks/brands'
import { setActiveDialog } from 'ducks/app'
import { connect } from 'react-redux'
import { Table, Button, Popconfirm, Icon, message, Modal, Form, Input, Select } from 'antd'

const FormItem = Form.Item
const loadingIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />

const formOptions = {
  onValuesChange: (props, values) => {},
}

@Form.create(formOptions)
@connect()
class BrandsManagement extends React.Component {
  state = {
    loading: false,
    loadingBrand: false,
    brands: [],
    isEdit: false,
    selectedBrand: {},
    dialogOpen: false,
    pagination: {
      showTotal: total => `Total ${total} items`,
      total: 0,
      pageSize: 20,
      current: 1,
    },
    filterValues: {},
  }

  componentDidMount() {
    this.fetchData()
  }

  fetchData = () => {
    const { dispatch } = this.props
    let { pagination, filterValues } = this.state
    const pagerOptions = {
      perPage: pagination.pageSize,
      page: pagination.current,
    }
    this.setState({
      loading: true,
    })
    dispatch(getBrands(filterValues, pagerOptions)).then(({ brands, pager }) => {
      this.setState({
        brands,
        loading: false,
        pagination: {
          total: +pager['x-pagination-total-count'],
          current: +pager['x-pagination-current-page'],
          pageSize: +pager['x-pagination-per-page'],
        },
      })
    })
  }

  deleteBrand = id => {
    const { dispatch } = this.props
    dispatch(deleteBrand(id)).then(() => {
      message.success('Brand was successfully deleted.')
      this.fetchData()
    })
  }

  onSubmit = () => {
    const { form, dispatch } = this.props
    const { isEdit, selectedBrand } = this.state
    form.validateFields((error, values) => {
      if (!error) {
        this.setState({
          loadingBrand: true,
        })
        dispatch(isEdit ? updateBrand(selectedBrand.id, values) : createBrand(values))
          .then(() => {
            this.setState({
              dialogOpen: false,
              isEdit: false,
              selectedBrand: {},
              loadingBrand: false,
            })
            form.resetFields()
            message.success(`Brand was successfully ${isEdit ? 'updated' : 'created'}`)
            this.fetchData()
          })
          .catch(() => {
            this.setState({
              dialogOpen: false,
              isEdit: false,
              selectedBrand: {},
              loadingBrand: false,
            })
          })
      }
    })
  }

  manageBrand = (id, name, aliases) => {
    if (id) {
      this.setState({
        isEdit: true,
        dialogOpen: true,
        selectedBrand: {
          id,
          name,
          aliases,
        },
      })
    } else {
      this.setState({
        dialogOpen: true,
      })
    }
  }

  hideDialog = () => {
    const { form } = this.props
    this.setState({
      dialogOpen: false,
      isEdit: false,
      selectedBrand: {},
    })
    form.resetFields()
  }

  handleTableChange = pager => {
    let { pagination } = this.state
    pagination.current = pager.current
    pagination.pageSize = pager.pageSize
    this.setState({
      pagination,
    })
    this.fetchData()
  }

  submitSearch = () => {
    const { form } = this.props
    form.validateFields((error, values) => {
      this.onSearch(values)
    })
  }

  onSearch = filterValues => {
    let { pagination } = this.state
    pagination.current = 1
    this.setState({
      filterValues,
      pagination,
    })
    this.fetchData()
  }

  render() {
    const { brands, loading, isEdit, selectedBrand, dialogOpen, pagination } = this.state
    const { form } = this.props
    const columns = [
      {
        title: 'Name',
        dataIndex: 'name',
        sorter: false,
        render: row => (row ? row : '—'),
      },
      {
        title: 'Aliases Count',
        dataIndex: 'aliases',
        sorter: false,
        render: row => (row ? (row.length > 0 ? row.length : '—') : '—'),
      },
      {
        title: 'Created At',
        dataIndex: 'createdAt',
        sorter: false,
        render: row => (row ? row : '—'),
      },
      {
        title: '',
        dataIndex: 'edits',
        sorter: false,
        width: '150px',
        render: (row, rows) => {
          return (
            <div className="text-right">
              <Button
                className="mr-3"
                size="small"
                icon="edit"
                onClick={() => this.manageBrand(rows.id, rows.name, rows.aliases)}
              >
                Edit
              </Button>
              <Popconfirm
                title={'Delete this brand?'}
                okText="Yes"
                cancelText="No"
                onConfirm={() => this.deleteBrand(rows.id)}
              >
                <Button className="mr-3" type="danger" size="small" icon="delete" />
              </Popconfirm>
            </div>
          )
        },
      },
    ]

    return (
      <div>
        <Modal
          title={isEdit ? 'Edit Brand' : 'Add Brand'}
          visible={dialogOpen}
          style={{ maxWidth: 700 }}
          footer={null}
          onCancel={this.hideDialog}
        >
          <Form hideRequiredMark>
            <div className="modal-body" style={{ minWidth: 'auto' }}>
              <div className="mt-1">
                <div className="row">
                  <div className="col-lg-12 offset-lg-0">
                    <FormItem label="Brand name" colon={false}>
                      {form.getFieldDecorator('name', {
                        initialValue: selectedBrand.name,
                        rules: [{ required: true }],
                      })(<Input size="default" />)}
                    </FormItem>
                    <FormItem label="Brand name" colon={false}>
                      {form.getFieldDecorator('aliases', {
                        initialValue: selectedBrand.aliases,
                        rules: [{ required: false }],
                      })(
                        <Select allowClear mode="tags" placeholder="Select aliases...">
                          {selectedBrand.aliases &&
                            selectedBrand.aliases.map(item => {
                              console.log('ITEM', item)

                              return <Select.Option key={item}>{item}</Select.Option>
                            })}
                        </Select>,
                      )}
                    </FormItem>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <Button type="primary" onClick={this.onSubmit} loading={this.state.loadingBrand}>
                Save brand
              </Button>
            </div>
          </Form>
        </Modal>
        <div>
          <div className="utils__title utils__title--flat mb-3">
            <span className="text-uppercase font-size-16">
              <strong>Brands Management</strong>
            </span>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="mb-4">
              <Button
                type="primary"
                className="mr-3 mb-2"
                icon="plus"
                onClick={() => this.manageBrand()}
              >
                Add New
              </Button>
              <Form hideRequiredMark className="mr-3 d-inline-block w-auto">
                <FormItem colon={false} className="mb-0">
                  {form.getFieldDecorator('filterName', {})(
                    <Input
                      size="default"
                      placeholder="Search brand..."
                      onChange={() => {
                        setTimeout(() => {
                          this.submitSearch()
                        })
                      }}
                    />,
                  )}
                </FormItem>
              </Form>
            </div>
            <Table
              className="text-nowrap mb-4"
              columns={columns}
              rowKey={record => record.id}
              dataSource={brands}
              loading={{ spinning: loading, indicator: loadingIcon }}
              scroll={{ x: 700 }}
              pagination={pagination}
              onChange={this.handleTableChange}
            />
            <div>
              <Button
                type="primary"
                className="mr-3 mb-2"
                icon="plus"
                onClick={() => this.manageBrand()}
              >
                Add New
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default BrandsManagement
