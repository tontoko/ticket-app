import { Spinner } from 'reactstrap'

const Loading = (props) => {
  const style = props.style ? props.style : {}
  return (
    <div
      style={{
        ...{
          opacity: 0.5,
          height: '100%',
          width: '100%',
          position: 'absolute',
          top: '0px',
          left: '0px',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
        ...style,
      }}
    >
      <Spinner
        style={{
          width: '8rem',
          height: '8rem',
        }}
        color="info"
      />
    </div>
  )
}

export default Loading
