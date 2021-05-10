const {Router} = require('express')
const Course = require('../models/course')
const router = Router()
const auth = require('../middleware/auth')

router.get('/', async (req, res) => {
  const courses = await Course.find().lean()
  .populate('userId', 'email name')
  console.log(courses)
  res.render('courses', {
    title: 'Курсы',
    isCourses: true,
    courses,
    isAuth: req.session.isAuth
  })
})

router.get('/:id/edit', auth, async (req, res) => {
  if (!req.query.allow) {
    return res.redirect('/')
  }

  const course = await Course.findOne({_id: req.params.id}).lean()

  res.render('course-edit', {
    title: `Редактировать ${course.title}`,
    course
  })
})

router.post('/edit', auth, async (req, res) => {
  
  const {_id} = req.body
  delete req.body._id
  await Course.findOneAndUpdate(_id, req.body).lean()
  res.redirect('/courses')
})
router.post('/remove', auth, async (req, res) => {
  try {
    await Course.deleteOne({_id:req.body._id})
    res.redirect('/courses')
  } catch(e) {
    console.log(e)
  }
})

router.get('/:id', async (req, res) => {
  const course = await Course.findById(req.params.id).lean()
  res.render('course', {
    layout: 'empty',
    title: `Курс ${course.title}`,
    course
  })
})

module.exports = router