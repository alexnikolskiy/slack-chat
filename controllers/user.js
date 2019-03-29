const path = require('path');
const multer = require('multer');
const md5 = require('md5');
const User = require('../models/user');

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = md5(req.user.username + Date.now());

    cb(null, `${filename}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname);

  if (!/\.(jpe?g|png)/i.test(ext)) {
    return cb(new Error('Only images are allowed'));
  }

  return cb(null, true);
};

const upload = multer({
  limits: {
    fileSize: 1024 * 1024,
  },
  storage,
  fileFilter,
}).single('file');

module.exports = {
  async getAll(req, res) {
    try {
      let users = [];

      users = await User.find();
      users = users.map(user => user.toJSONFor());

      res.status(200).json({ success: true, data: users });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  },
  async getOne(req, res) {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        res.status(404).json({ success: false, error: 'Not found' });
      }

      res.status(200).json({ success: true, data: user.toJSONFor() });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  },
  async save(req, res) {
    upload(req, res, async err => {
      if (err) {
        return res.status(400).json({ success: false, error: err.message });
      }

      try {
        const avatar = JSON.parse(req.body.isDeleted) ? '' : req.user.avatar;

        await User.findByIdAndUpdate(req.params.id, {
          ...req.body,
          avatar: req.file ? req.file.filename : avatar,
        });

        const user = await User.findById(req.params.id);

        // user.id = user._id;
        // delete user._id;

        return res.status(200).json({ success: true, data: user.toJSONFor() });
      } catch (e) {
        return res.status(400).json({ success: false, error: e.message });
      }
    });
  },
};
