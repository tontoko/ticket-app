import { Alert } from 'reactstrap'

const alert = ({ style, options, message, close }) => {
    let color =''
    if (options.type === 'success') color = 'success'
    if (options.type === 'error') color = 'danger'
    if (options.type === 'info') color = 'info'
    return (
        <Alert color={color} style={{...style, opacity: '0.95'}} onClick={close}>
            {message}
        </Alert>
    )
}

export default alert