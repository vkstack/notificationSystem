[Notification Management](https://github.com/vkstack/notificationSystem)

What things i have used ( **developed on Ubuntu machine** )

1. **1.** nodeJS **4.4** as backend server. [[install]](https://nodejs.org/en/download/package-manager/)
2. **2.** rabbitMQ for queuing server. [[install]](https://www.rabbitmq.com/download.html)
3. **3.** Mongodb as data store. [[install]](https://www.mongodb.com/download-center?jmp=nav#community)
4. **4.** Materializecss as front-end CSS framework.
5. **5.** AngularJS as frontend javascript framework.
6. **6.** SailsJS applications framework.
7. **7.** Git (for pulling from repo).

# Installing and setup on Ubuntu machine

Install nodeJS(4.4)

**curl -sL https://deb.nodesource.com/setup\_4.x | sudo -E bash -
sudo apt-get install -y nodejs**

Install RabbitMQ

**Using rabbitmq.com APT Repository.** [see here](https://www.rabbitmq.com/install-debian.html)

1. **1.** Execute the following command to add the APT repository to your /etc/apt/sources.list.d:
  1. **a.**** echo &#39;deb http://www.rabbitmq.com/debian/ testing main&#39; | sudo tee /etc/apt/sources.list.d/rabbitmq.list**
2. **2.**  (Please note that the word testing in this         line refers to the state of our release of RabbitMQ, not         any particular Debian distribution. You can use it with         Debian stable, testing or unstable, as well as with         Ubuntu. We describe the release as &quot;testing&quot; to emphasise         that we release somewhat frequently.)
3. **3.**  (optional) To avoid warnings about unsigned packages, add         our [public         key](https://www.rabbitmq.com/rabbitmq-release-signing-key.asc) to your trusted key list using         apt-key(8):
  1. **a.**** wget -O- https://www.rabbitmq.com/rabbitmq-release-signing-key.asc | sudo apt-key add -**
4. **4.** Our public signing key is also [available from Bintray](https://bintray.com/rabbitmq/Keys/download_file?file_path=rabbitmq-release-signing-key.asc).
5. **5.**  Run the following command to update the package list:
  1. **a.**** sudo apt-get update**
6. **6.**  Install rabbitmq-server package:
  1. **a.**** sudo apt-get install rabbitmq-server**

Start rabbitMQ-server by this:     **sudo service rabbitmq-server start**



Install MongoDB

[Complete installation method](https://docs.mongodb.com/master/tutorial/install-mongodb-on-ubuntu/?_ga=1.267291661.2042427415.1465602590)

After installing mongo do the following.

1. **1.**** sudo mkdir -p /data/db**
2. **2.** Start mongod in master mode
  1. **a.**** sudo mongod --master --fork --logpath /var/log/mongodb.log**

All applications which were required are installed.



# Setup Project

In terminal fire the following comands

1. **1.**** git clone**[**git@github.com**](mailto:git@github.com)**:vkstack/notificationSystem.git**
2. **2.**** cd notificationSystem**
3. **3.**** mongorestore dump**
4. **4.**** npm install**
5. **5.**** (**Make sure mongodb &amp; rabbitMQ server is running.)
6. **6.**** node app.js**

Now got to **localhost:1337** in the browser.

You can create user by signing up.Or you can login with following users:

**Usernames        Password**

vajahat  admin    (Only this is admin user.This will be notified for       every single change. Rest are normal users they       will subscribe for collection or documents)

jack   normal

jim  normal

bob   normal

tim   normal

Update notifications is enabled only on **news** collection.

insert /update/delete notifications in news channel is rendered in raw json format on the notification panel.



# Resoureces:

1. **1.** [https://www.compose.io/articles/node-js-and-mongo-oplog-elegant-oplog-consumption/](https://www.compose.io/articles/node-js-and-mongo-oplog-elegant-oplog-consumption/)
2. **2.** [https://www.compose.io/articles/the-mongodb-oplog-and-node-js/](https://www.compose.io/articles/the-mongodb-oplog-and-node-js/)
3. **3.** Notification technique from (This was very challenging and interesting task)
  1. **a.** [http://stackoverflow.com/questions/1086380/how-does-facebook-gmail-send-the-real-time-notification](http://stackoverflow.com/questions/1086380/how-does-facebook-gmail-send-the-real-time-notification)
4. **4.** RabbitMQ help [http://stackoverflow.com/questions/37695995/remove-a-consumer-in-rabbitmq-with-nodejs](http://stackoverflow.com/questions/37695995/remove-a-consumer-in-rabbitmq-with-nodejs)
