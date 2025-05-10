require('dotenv').config(); 
const mongoose = require('mongoose');
const prompt = require('prompt-sync')();
const Customer = require('./models/Customer'); //Customer model


const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully.');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};


const run = async () => {
  await connectDb();

  console.log('Welcome to the CRM\n');

  let running = true;
  while (running) {
    console.log('What would you like to do?\n');
    console.log('  1. Create a customer');
    console.log('  2. View all customers');
    console.log('  3. Update a customer');
    console.log('  4. Delete a customer');
    console.log('  5. Quit\n');

    const choice = prompt('Number of action to run: ');

    switch (choice) {
      case '1':
        // Create Customer
        const name = prompt("What is the customer's name? ");
        const age = prompt("What is the customer's age? ");
        try {
          const newCustomer = await Customer.create({ name, age });
          console.log(`\nNew customer created successfully: ${newCustomer.name}, Age: ${newCustomer.age}\n`);
        } catch (error) {
          console.error('\nError creating customer:', error, '\n');
        }
        break;
      case '2':
        // View Customers
        try {
          const customers = await Customer.find({});
          if (customers.length === 0) {
            console.log('\nNo customers found.\n');
          } else {
            console.log('\n--- All Customers ---');
            customers.forEach(customer => {
              console.log(`id: ${customer._id} -- Name: ${customer.name}, Age: ${customer.age}`);
            });
            console.log('---------------------\n');
          }
        } catch (error) {
          console.error('\nError fetching customers:', error, '\n');
        }
        break;
      case '3':
        // Update Customer
        try {
          const customersToUpdate = await Customer.find({});
          if (customersToUpdate.length === 0) {
            console.log('\nNo customers to update.\n');
            break; // Go back to customers
          }

          console.log('\nBelow is a list of customers: \n');
          customersToUpdate.forEach(customer => {
            console.log(`id: ${customer._id} -- Name: ${customer.name}, Age: ${customer.age}`);
          });
          console.log('');

          const idToUpdate = prompt('Copy and paste the id of the customer you would like to update here: ');

          
          if (!mongoose.Types.ObjectId.isValid(idToUpdate)) {
             console.log('\nInvalid ID format.\n');
             break;
          }

          const customerToUpdate = await Customer.findById(idToUpdate);
          if (!customerToUpdate) {
            console.log('\nCustomer not found with that ID.\n');
            break;
          }

          const newName = prompt(`What is the customer's new name? (Current: ${customerToUpdate.name}) `);
          const newAge = prompt(`What is the customer's new age? (Current: ${customerToUpdate.age}) `);

          // findByIdAndUpdate 
          const updatedCustomer = await Customer.findByIdAndUpdate(
            idToUpdate,
            { name: newName || customerToUpdate.name, age: newAge || customerToUpdate.age }, 
            { new: true } 
          );

          if (updatedCustomer) {
            console.log(`\nCustomer updated successfully: id: ${updatedCustomer._id} -- Name: ${updatedCustomer.name}, Age: ${updatedCustomer.age}\n`);
          } else {
             
            console.log('\nFailed to update customer. Customer might have been deleted.\n');
          }

        } catch (error) {
          console.error('\nError updating customer:', error, '\n');
        }
        break;
      case '4':
        // Delete Customer
        try {
          const customersToDelete = await Customer.find({});
          if (customersToDelete.length === 0) {
            console.log('\nNo customers to delete.\n');
            break; 
          }

          console.log('\nBelow is a list of customers: \n');
          customersToDelete.forEach(customer => {
            console.log(`id: ${customer._id} -- Name: ${customer.name}, Age: ${customer.age}`);
          });
           console.log(''); 

          const idToDelete = prompt('Copy and paste the id of the customer you would like to delete here: ');

          
          if (!mongoose.Types.ObjectId.isValid(idToDelete)) {
             console.log('\nInvalid ID format.\n');
             break;
          }

          
          const deletedCustomer = await Customer.findByIdAndDelete(idToDelete);

          if (deletedCustomer) {
            console.log(`\nCustomer deleted successfully: Name: ${deletedCustomer.name}, Age: ${deletedCustomer.age}\n`);
          } else {
            console.log('\nCustomer not found with that ID. No customer deleted.\n');
          }

        } catch (error) {
          console.error('\nError deleting customer:', error, '\n');
        }
        break;
      case '5':
        running = false;
        break;
      default:
        console.log('\nInvalid choice. Please enter a number between 1 and 5.\n');
    }
  }

  console.log('\nExiting...');
  await mongoose.connection.close();
  console.log('MongoDB connection closed.');
};

run(); 
