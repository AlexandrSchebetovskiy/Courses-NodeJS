const {Router} = require('express')
const Course = require('../models/course')
const router = Router()
const auth = require('../middleware/auth')



function mapCart(cart) {
  return cart.items.map(c => ({
    ...c.courseId._doc, 
    count: c.count,
    id: c.courseId.id
  }))
}
function computePrice(courses) {
  return courses.reduce((total, course) => {
    return total += course.count * course.price
  }, 0)
}

router.post('/add', auth, async (req, res) => {
  const course = await Course.findById(req.body.id).lean()
  const a = await req.user.addToCart(course)
  res.redirect('/card')
})

router.delete('/remove/:id', auth, async (req, res) => {
  await req.user.removeFromCart(req.params.id)
  const user = await req.user.populate('cart.items.courseId').execPopulate()
  const courses = mapCart(user.cart)
  console.log('2222',courses)
  const cart = {
    courses,
    price:computePrice(courses)
  }
  res.status(200).json(cart)
})

router.get('/', auth, async (req, res) => {
  const user = await req.user
    .populate('cart.items.courseId')
    .execPopulate()

  const courses = mapCart(user.cart)
  console.log('111',courses)
  res.render('card', {
    title: 'Корзина',
    isCard: true,
    courses,
    price:computePrice(courses)
  })
})

module.exports = router