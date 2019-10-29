import React from 'react';
import { Form, Icon, Input, Button } from 'antd';


class LoginForm extends React.Component {
    handleSubmit = e => {
        e.preventDefault();
        console.log( this.props );
        const { form, handleLogin } = this.props;

        form.validateFields((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
                handleLogin(values)
            }
        });

    };

    render() {
        const { getFieldDecorator } = this.props.form;
        return (
            <div style={{padding: `300px` }}>
                <h2>WP Kanban Login</h2>
                <Form  onSubmit={this.handleSubmit} className="login-form">
                    <Form.Item>
                        {getFieldDecorator('username', {
                            rules: [{ required: true, message: 'Please input your username!' }],
                        })(
                            <Input
                                prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                placeholder="Username"
                            />,
                        )}
                    </Form.Item>
                    <Form.Item>
                        {getFieldDecorator('password', {
                            rules: [{ required: true, message: 'Please input your Password!' }],
                        })(
                            <Input
                                prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                type="password"
                                placeholder="Password"
                            />,
                        )}
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" className="login-form-button">
                            Log in
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        );
    }
}
export default Form.create({name: 'Login'})(LoginForm);
