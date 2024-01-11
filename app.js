const session = require('express-session');
const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const app = express();
const port = 3000;


app.use('/public', express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.use(session({
  secret: 'hoanlucky0803',
  resave: false,
  saveUninitialized: true
}));


app.use(bodyParser.urlencoded({ extended: true }));

global.taikhoan_ss = "";
global.mail_ss = "";
global.ten_ss ="";

// Connect MongoDB Alats
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://hoanlucky:hoanlucky@cluster0.lv314o5.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

async function check_login_s(req_, ts1, ts2) {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    // run().catch(console.dir);
	const database = await client.db('DTDM');
	const collection = await database.collection('user_web');
	const check_user = await collection.findOne({ user: ts1 });
	
	if (check_user) {
		console.log(check_user.pass);
		console.log(ts2);
		var chuoia = String(check_user.pass).replace(/ /g, "");
		var chuoib = String(ts2).replace(/ /g, "");
		var mail_ = String(check_user.mail)
		var ten_ = String(check_user.name)

		if (chuoia.trim() == chuoib.trim()) {
			req_.session.taikhoan = ts1;
			req_.session.mail = mail_;
			req_.session.ten = ten_;
			taikhoan_ss = ts1;
			mail_ss = mail_;
			ten_ss = ten_;
			console.log(mail_);
			console.log(ten_);
			return ten_;
		}
	}
	else{
		console.log('khong ton tai tai khoan')
	}
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

async function check_login(req_, ts1, ts2) {
	run().catch(console.dir);
	const database = await client.db('DTDM');
	const collection = await database.collection('user_web');
	const check_user = await collection.findOne({ user: ts1 });
	await client.close();
	console.log(check_user.pass);
	console.log(ts2);
	if (check_user) {
		if ((check_user.pass).toString().trim() == ts2.toString().trim()) {
			req_.session.taikhoan = ts1;
			req_.session.mail = check_user.mail;
			req_.session.ten = check_user.name;
			return true;
		}
	}
	else{
		return false;
	}
}


// Home
app.get('/', async (req, res) => {
  if (req.session.taikhoan){
  	try {
	    // Connect the client to the server	(optional starting in v4.7)
	    await client.connect();
	    // Send a ping to confirm a successful connection
	    await client.db("admin").command({ ping: 1 });
	    console.log("You successfully connected to MongoDB!");
	    const database = await client.db('DTDM');
		const collection = await database.collection('BlockChain');
		const giaodich_ct = await collection.find({username1:taikhoan_ss,thaotac:'gui'}).toArray();
		const giaodich_nt = await collection.find({username1:taikhoan_ss,thaotac:'nhan'}).toArray();
		const all_giaodich = await collection.find({username1:taikhoan_ss}).toArray();
		res.render('index',{giaodich_ct,giaodich_nt,all_giaodich,ten_ss});
		// res.send("ok");

	} finally {
	    // Ensures that the client will close when you finish/error
	    await client.close();
	}
  }
  else res.redirect('/login');
});

app.post("/", async(req,res) => {
	const nguoinhan = req.body._nguoinhan_;
	const sotien = req.body._sotien_;
	try {
	    // Connect the client to the server	(optional starting in v4.7)
	    await client.connect();
	    // Send a ping to confirm a successful connection
	    await client.db("admin").command({ ping: 1 });
	    console.log("You successfully connected to MongoDB!");
	    const database = await client.db('DTDM');
		const collection = await database.collection('BlockChain');
		var sodu1 = 0;
		var sodu2 = 0;
		const getsd1 = await collection.find({username1:taikhoan_ss}).toArray();
		getsd1.forEach(record => {
			sodu1 = record.sodu;
		});
		const getsd2 = await collection.find({username1:nguoinhan}).toArray();
		getsd2.forEach(record => {
			sodu2 = record.sodu;
		});

		const new_gui = {
			amount: parseInt(sotien),
			hash: "157efa3d3a9bc8f597d86f605847ecb2db854fa3859546c1ae90b3a95c035acd",
			previousHash: "hshhfhfhj929424jhhjd9294894n42494",
			sodu: sodu1-parseInt(sotien),
			thaotac: "gui",
			timestamp: (new Date()).toString(),
			username1: taikhoan_ss,
			username2: nguoinhan
		};

		const new_nhan = {
			amount: parseInt(sotien),
			hash: "157efa3d3a9bc8f597d86f605847ecb2db854fa3859546c1ae90b3a95c035acd",
			previousHash: "hshhfhfhj929424jhhjd9294894n42494",
			sodu: sodu2+parseInt(sotien),
			thaotac: "nhan",
			timestamp: (new Date()).toString(),
			username1: nguoinhan,
			username2: taikhoan_ss
		};

		await collection.insertOne(new_gui);
		await collection.insertOne(new_nhan);


		res.send(`<script>alert('Chuyển tiền thành công!');setTimeout(() => {window.location.href = '/';}, 3000);</script>`);

	} finally {
	    // Ensures that the client will close when you finish/error
	    await client.close();
	}
});

// Login
app.get('/login', (req, res) => {
  res.render('pages-login')
});

app.post('/login', (req, res) => {
	const username = req.body.username;
	const password = req.body.password;
	req.session.taikhoan = username;
	var aaa = check_login_s(req, username, password);
	res.send(`<script>document.write('Chuyển hướng sau 3 giây!');setTimeout(() => {window.location.href = '/';}, 3000);</script>`);
});

app.get('/sign', (req, res) => {
  res.render('pages-register')
});

app.post('/sign', async(req, res) => {
	const _name = req.body.name;
	const _mail = req.body.email;
	const _user = req.body.users;
	const _password = req.body.password;
	try {
	    // Connect the client to the server	(optional starting in v4.7)
	    await client.connect();
	    // Send a ping to confirm a successful connection
	    await client.db("admin").command({ ping: 1 });
	    console.log("You successfully connected to MongoDB!");
	    const database = await client.db('DTDM');
		const collection = await database.collection('BlockChain');
		const collection2 = await database.collection('user_web');
		new_member = {
			user: _user,
			pass: _password,
			name: _name,
			mail: _mail
		};
		await collection2.insertOne(new_member);

		var sodu1 = 0;
		const getsd1 = await collection.find({username1:'admin'}).toArray();
		getsd1.forEach(record => {
			sodu1 = record.sodu;
		});

		const new_gui = {
			amount: 0,
			hash: "157efa3d3a9bc8f597d86f605847ecb2db854fa3859546c1ae90b3a95c035acd",
			previousHash: "hshhfhfhj929424jhhjd9294894n42494",
			sodu: sodu1,
			thaotac: "gui",
			timestamp: (new Date()).toString(),
			username1: 'admin',
			username2: _user
		};

		const new_nhan = {
			amount: 0,
			hash: "157efa3d3a9bc8f597d86f605847ecb2db854fa3859546c1ae90b3a95c035acd",
			previousHash: "hshhfhfhj929424jhhjd9294894n42494",
			sodu: 0,
			thaotac: "nhan",
			timestamp: (new Date()).toString(),
			username1: _user,
			username2: 'admin'
		};

		await collection.insertOne(new_gui);
		await collection.insertOne(new_nhan);


	} finally {
	    // Ensures that the client will close when you finish/error
	    await client.close();
	}
	res.send(`<script>document.write('Chuyển hướng sau 3 giây!');setTimeout(() => {window.location.href = '/';}, 3000);</script>`);
});

// const newData = {
//       amount: 111111,
//       hash: "157efa3d3a9bc8f597d86f605847ecb2db854fa3859546c1ae90b3a95c035acd",
//       previousHash: "000000000000",
//       sodu: "999999",
//       thaotac: "nhan",
//       timestamp: "30-10-2023",
//       username1: "admin",
//       username2: "admin2"
//     };

// const result = collection.insertOne(newData);


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});