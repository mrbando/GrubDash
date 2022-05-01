const path = require("path");
const orders = require(path.resolve("src/data/orders-data"));
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

///////////////////// VALIDATE //////////////////////

function validator(selected) {
  return function (req, res, next) {
    const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;
    if (selected == "deliverTo") {
      if(!deliverTo || deliverTo === ""){
          next({ status: 400, message: 'A deliverTo is required.'})
        }
      return next();
     }
     else if (selected == "mobileNumber") {
      if(!mobileNumber || mobileNumber === ""){
          next({ status: 400, message: 'A mobileNumber is required.'})
        }
      return next();
     }
     else if (selected == "mobileNumber") {
      if(!mobileNumber || mobileNumber === ""){
          next({ status: 400, message: 'A mobileNumber is required.'})
        }
      return next();
     }
     else if (selected == "dishes") {
      if(!dishes || dishes.length <= 0){
          next({ status: 400, message: 'Order must include at least one dish.'})
        }
      if(!Array.isArray(dishes)){
          next({ status: 400, message: 'dishes needs to be an array.'})
        }
      return next();
     }
    else {
      console.log("Validator Error")
    }
}
}

function dishValidator(req, res, next){
  const {data: { dishes } = {}} = req.body
  const missingQuantity = dishes.find((dish) => !dish.quantity);
  const notAInteger = dishes.find((dish) => !Number.isInteger(dish.quantity));
  const zero = dishes.find((dish) => dish.quanity == 0);
    if(missingQuantity){
        const index = dishes.indexOf(missingQuantity)
        next({status: 400, message: `Dish ${index} must have a quantity that is an integer greater than 0.`})}
    if(notAInteger){
        const index = dishes.indexOf(notAInteger)
        next({status: 400, message: `Dish ${index} must have a quantity that is an integer greater than 0.`})}
    if(zero){
        const index = dishes.indexOf(zero)
        next({status: 400, message: `Dish ${index} must have a quantity that is an integer greater than 0.`})}
    next();
    }


function orderExists(req, res, next) {
  const orderId = req.params.orderId;
  const foundOrder = orders.filter((order) => order.id === orderId);
  if (foundOrder.length > 0) {
    res.locals.order = foundOrder;
    next();
  } else {
    next({ status: 404, message: `Order ${orderId} not found.` });
  }
}

function isIdValid(req, res, next) {
  let {
    data: { id },
  } = req.body;
  const orderId = req.params.orderId;
  if (
    id === null ||
    id === undefined ||
    id === ""
  ) {
    next();
  }
  if (id !== orderId) {
    next({
      status: 400,
      message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`,
    });
  } else {
    next();
  }
}

function statusValidator (req, res, next) {
  const { data: { status } = {} } = req.body;

  try {
    if (
      status !== ("pending" || "preparing" || "out-for-delivery" || "delivered")
    ) {
      next({
        status: 400,
        message:
          " Order must have a status of pending, preparing, out-for-delivery, delivered.",
      });
    }
    if (status === "delivered") {
       next({
        status: 400,
        message: " A delivered order cannot be changed.",
      });
    }
    next();
  } catch (error) {
    console.log("ERROR =", error);
  } 
}

/////////////////////////////////////////
////////// CRUDL FUNCTIONS ////////////////
////////////////////////////////////////

// Create 
function create (req, res) {
   const { data: {deliverTo, mobileNumber, status, dishes} = {} } = req.body
    const newId = new nextId();
    const newOrder = {
        id: newId,
        deliverTo: deliverTo,
        mobileNumber: mobileNumber,
        status: status,
        dishes: dishes,
    }
    orders.push(newOrder)
    res.status(201).json({data: newOrder})
}

// Read 
function read (req, res, next) {
  const foundOrder = res.locals.order;
  if (foundOrder) {
    res.json({ data: foundOrder[0] });
  }
}

// Update 
function update (req, res) {
  const orderId = req.params.orderId;
  let { data: id, deliverTo, mobileNumber, status, dishes } = req.body;
  let updatedOrder = {
    id: orderId,
    deliverTo: req.body.data.deliverTo,
    mobileNumber: req.body.data.mobileNumber,
    status: req.body.data.status,
    dishes: req.body.data.dishes,
  };

  return res.json({ data: updatedOrder });
}

// Delete
function destroy (req, res, next) {
  const orderId = req.params.orderId;
  const foundOrder = res.locals.order;
  const index = orders.find((order) => order.id === Number(orderId));
  const toDelete = orders.splice(index, 1);
  if (foundOrder[0].status === "pending") {
    //console.log("foundOrder.status = ", foundOrder[0].status);
    res.sendStatus(204);
  }

  next({
    status: 400,
    message: "An order cannot be deleted unless it is pending.",
  });
}

// List
function list (req, res) {
  res.json({ data: orders });
}

////////////////////////////////////////
////////////////////////////////////////

module.exports = {
  create: [
    validator("deliverTo"),
    validator("mobileNumber"),       
    validator("dishes"),
    dishValidator,
    create
  ],
  read: [orderExists, read],
  update: [
    orderExists,
    validator("deliverTo"),
    validator("mobileNumber"),
    validator("dishes"),
    dishValidator,
    isIdValid,
    statusValidator,
    update,
  ],
  destroy: [orderExists, destroy],
  list,
};















