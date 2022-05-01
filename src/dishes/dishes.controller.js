const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass


function list(req, res, next) {
    res.json({ data: dishes }); 
 };

/// Dish Exists

function dishExists(req, res, next) {
  const dishId = req.params.dishId;
  foundDish = dishes.filter((dish) => dish.id === dishId);
  if (foundDish.length > 0) {
    res.locals.dish = foundDish;
    next();
  } else {
    next({ status: 404, message: `Dish ${dishId} not found.` });
  }
}

/////////////////////////////////

/// Create 

function create(req, res) {
    const { data: {name, description, price, image_url} = {} } = req.body
    const newId = new nextId();
    const newDish = {
        id: newId,
        name: name,
        description: description,
        price: price,
        image_url: image_url,
    }
    dishes.push(newDish);
    res.status(201).json({ data: newDish });
  }

///////////////////////////////////
// DATA VALIDATOR ////////////////
///////////////////////////////////
 function dataValidator(propertyName) {
    return function (req, res, next) {
      const { data: {name, description, price, image_url} = {} } = req.body;
      // NAME VALIDATOR
      if (propertyName == "name"){
        if(!name || name === ""){
        next({
            status: 400,
            message: 'A name is required.'
        })
          } else {return next();}
      }
      //////////////////////////
      // DESCRIPTION VALIDATOR
      else if (propertyName == "description"){
        if(!description || description === ""){
        next({
            status: 400,
            message: 'A description is required.'
        })
        }
      return next();
      }
      //////////////////////////
      // PRICE VALIDATOR
      else if (propertyName == "price"){
        if (
            price === null ||
            price === undefined ||
            price === ""
          ) {
            next({ status: 400, message: "Dish must include a price." });
          }
            if (typeof price === "number" && price > 0) {
              return next();
            } else {
              next({
                status: 400,
                message: `The price must be a number greater than 0.`,
              });
            }
      }
      //////////////////////////
      // IMG VALIDATOR
      else if (propertyName == "image_url") {
        if(!image_url || image_url === ""){
        next({
            status: 400,
            message: 'An image_url is required.'
        })
        }
          return next();
       } else {
         console.log("DATA VALIDATOR IF STATEMENT DIDN'T READ")
       }
      }
    };
///////////////////////////////////
///////////////////////////////////
///////////////////////////////////

/// Read
function read(req, res, next) {
    const { dishId } = req.params;
    if(dishId){
        const found = dishes.find((dish) => dishId === dish.id)
        res.json({data: found})
    }
  }
////////////////////

/// Update

function isIdValid(req, res, next) {
  let {
    data: { id },
  } = req.body;
  const dishId = req.params.dishId;
  if (
    req.body.data.id === null ||
    req.body.data.id === undefined ||
    req.body.data.id === ""
  ) {
    return next();
  }
  if (req.body.data.id !== dishId) {
    next({
      status: 400,
      message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
    });
  } else {
    next();
  }
}

function update(req, res) {
  dishId = req.params.dishId;
  let {
    data: { name, description, price, image_url },
  } = req.body;
  let updatedDish = {
    id: dishId,
    name: req.body.data.name,
    description: req.body.data.description,
    price: req.body.data.price,
    image_url: req.body.data.image_url,
  };
  return res.json({ data: updatedDish });
}

//////////



  module.exports = {
    list,
    read: [dishExists, read],
    create: [
        dataValidator("name"),
        dataValidator("description"),
        dataValidator("price"),
        dataValidator("image_url"), 
        create
    ],
    update: [
        dishExists,
        isIdValid,
        dataValidator("name"),
        dataValidator("description"),
        dataValidator("price"),
        dataValidator("image_url"), 
        update
    ]
  } 