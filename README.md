# StorageModel
is a library that provides an abstraction/interface ORM(Object Relational Mapper), in order to facilitate the manipulation of data registered in the localstorage.
___
Special thanks to the lala-web-sql project (https://github.com/jefersondaniel/lala-web-sql) that inspired the architecture for this project.
___

## Using:

#### new Instance:
```javascript
var users = new StorageModel('User');
users
// out: StorageModel {model: "User", columns: Array[0], fields: Object}
```

#### create:
```javascript
users.create({
   name: 'Geroudo',
   age: 18
});
// out: Object {name: "Geroudo", age: 18, id: 1, status: 1}
users.create({
   name: 'Sterferson',
   age: 20
});
// out: Object {name: "Sterferson", age: 20, id: 2, status: 1}
```

#### Building queries:
```javascript
users.all().get(); // or users.all().toArray();

users.find(1); // find by id
users.find({name: 'Geroudo'});

users.all().orderBy('age', 'dec').each(function(user){
   console.log(user);
});
```

#### Updating:
```javascript
users.update({
    name: 'Wellington'
}, 1);
// out: Object {name: "Wellington", age: 18, id: 1, status: 1}

users.where('id', '>', 1).update({
    'status': 0
});
```

#### Delete:
```javascript
users.remove(1); // In this case only the status for 0
// out: Object {name: "Wellington", age: 18, id: 1, status: 0}

users.remove(1, true); // Force a removal
```

#### Other functions:
```javascript
// counting
users.count();
users.where('age', '>', 18).count();

// properties
users.model // out: "User"
users.columns // out: ["name", "age", "id", "status"]

// Selection limit
users.all().first();
users.where('age', '>', 18).take(2);
```

#### Drop:
```javascript
users.dropModel(); // Clear the table

users.drop(); // Clear the localstorage
```

### LICENSE
This project is licensed under the MIT License. This means you can use and modify it for free in private or commercial projects.

### Development
It is required node.js and npm
* [Node.js](https://nodejs.org/en/)
* [Npm](https://www.npmjs.com/)
___
    $ git clone https://github.com/Wellington475/StorageModel
    $ npm install
___
