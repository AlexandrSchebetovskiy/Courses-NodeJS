const {Router} = require('express')
const router = Router()
const Order = require('../models/order')
const auth = require('../middleware/auth')


router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({'user.userId': req.user._id})
      .populate('user.userId')
      console.log('lll',orders)
    res.render('orders', {
      isOrder:true, 
      title: 'Заказы', 
      orders: orders.map(o => {
        return {
          date: o.date,
          name: o.user.userId.name,
          email: o.user.userId.email,
          courses:o.courses,
          price: o.courses.reduce((total, c) => {
            return total+=c.count*c.course.price
          }, 0)
        }
      })
    })
  } catch(e) {
    console.log(e)
  }
  
})


router.post('/', auth, async (req, res) => {
  try {
    const user = await req.user
    .populate('cart.items.courseId')
    .execPopulate()
  const courses = user.cart.items.map(i=> ({
    count:i.count,
    course: {...i.courseId._doc}
  }))
  const order = new Order({
    user: {
      name: req.user.name,
      userId: req.user
    }, 
    courses
  })
  await order.save()
  await req.user.clearCart()
  res.redirect('orders')
  } catch(e) {
    console.warn(e)
  }
 
})

module.exports = router