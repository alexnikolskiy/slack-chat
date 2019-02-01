import config from '../../../config';

export default window.io(`${config.socket.url}`, config.socket.options);
