import { Spinner } from 'reactstrap'

export default () => {
    return (
        <div style={{
            opacity: 0.5,
            height: "100%",
            width: "100%",
            position: "absolute",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        }}>
            <Spinner style={
                {
                    width: '8rem',
                    height: '8rem'
                }
            }
            color="info" 
            />
        </div>
    )
}