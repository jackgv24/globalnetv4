import React, { Fragment , useState , useEffect } from 'react';

const Loader = () => {
    const [show, setShow] = useState(true);
    useEffect(() => {
        const id = setTimeout(() => {
            setShow(false)
          }, 1000);
        return ()=>{
            console.log(id);
            clearTimeout(id);
        };
    },[show]);
    return (
        <Fragment>
            <div className={`loader-wrapper ${show ? '' : 'loderhide'}`} >
                <div className="loader bg-white">
                    <div className="whirly-loader"> </div>
                </div>
            </div>
        </Fragment>
    );
};

export default Loader;