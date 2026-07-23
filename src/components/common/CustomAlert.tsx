import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CustomAlert = () => {
  return (
    <ToastContainer position="top-right" newestOnTop closeButton={true} theme="colored" limit={5} />
  );
};

export default CustomAlert;
