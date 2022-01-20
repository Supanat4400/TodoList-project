//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect("mongodb+srv://Supanat4400:0925294400@cluster0.mohdo.mongodb.net/todolistDB", {useNewUrlParser: true});

const itemsSchema = new mongoose.Schema({
  name : String
});

const Item = mongoose.model("item", itemsSchema);

const item1 = new Item({
  name: "Wake up before 9.00"
});

const item2 = new Item({
  name: "Breakfast"
});

const defaultItems = [item1, item2];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {


  Item.find({}, function(err, foundItems){

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err){
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully savevd default items to DB.");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });

});

app.get("/:listsType", function(req, res){
  const requestList =_.capitalize(req.params.listsType);

  List.findOne({name: requestList}, function(err, results){
    if (!err){
      if (!results){
        const list = new List({
          name: requestList,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+ requestList);
      
      }else {
        res.render("list", {listTitle: results.name, newListItems: results.items})  
      }
    }
  });
});


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });

 

  if (listName === "Today"){
    item.save();
    console.log("item ADDED");
    res.redirect("/");
  } else{
   List.findOne({name: listName}, function(err, foundList){
    
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
   });
  }
  
});


app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if (err){
        console.log(err);
      }else{
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      }
    });
  }
  else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id:checkedItemId}}}, function(err, foundList){
      if (!err){
        res.redirect("/"+listName);
      }
    });
  }


});



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
