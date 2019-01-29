import config from '../../../config';

export default io(`${config.socket.url}`, config.socket.options);
