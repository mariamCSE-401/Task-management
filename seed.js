
const db = require('./src/config/db'); // database connection

async function seedTasks() {
  try {
    
    const [rows] = await db.query('SELECT COUNT(*) AS count FROM tasks');
    if (rows[0].count > 0) {
      console.log('Tasks already seeded. Exiting...');
      process.exit(0);
    }

    // Sample tasks (status must match ENUM in table: pending, in_progress, completed)
    const tasks = [
      { title: 'Buy groceries', description: 'Milk, eggs, bread', status: 'pending' },
      { title: 'Finish report', description: 'Annual report draft', status: 'in_progress' },
      { title: 'Call Ali', description: 'Discuss project', status: 'completed' },
      { title: 'Plan vacation', description: 'Decide destination and budget', status: 'pending' },
      { title: 'Clean house', description: 'Living room and kitchen', status: 'pending' },
      { title: 'Pay bills', description: 'Electricity and Internet', status: 'in_progress' },
      { title: 'Read book', description: 'Start "Atomic Habits"', status: 'completed' },
      { title: 'Workout', description: 'Gym session', status: 'pending' },
      { title: 'Fix bike', description: 'Change tire', status: 'in_progress' },
      { title: 'Write blog', description: 'Node.js tutorial', status: 'completed' },
      { title: 'Email John', description: 'Project updates', status: 'pending' },
      { title: 'Backup files', description: 'On external hard drive', status: 'in_progress' },
      { title: 'Grocery shopping', description: 'Fruits and vegetables', status: 'pending' },
      { title: 'Meditate', description: 'Morning session', status: 'completed' },
      { title: 'Update CV', description: 'Add recent projects', status: 'in_progress' },
    ];

    // Insert tasks into DB
    for (const task of tasks) {
      await db.query(
        'INSERT INTO tasks (title, description, status) VALUES (?, ?, ?)',
        [task.title, task.description, task.status]
      );
    }

    console.log('Tasks seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding tasks:', err);
    process.exit(1);
  }
}

// Execute seeding
seedTasks();
