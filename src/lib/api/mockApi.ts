// Simulated database
const db = {
  users: [
    {
      id: '1',
      email: 'demo@example.com',
      name: 'Demo User',
      role: 'admin',
      communities: ['default'],
      createdAt: new Date().toISOString(),
    },
  ],
};

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function mockLogin(email: string, password: string) {
  await delay(500); // Simulate network latency
  
  const user = db.users.find(u => u.email === email);
  
  if (!user) {
    throw new Error('Invalid email or password');
  }
  
  // In mock mode, we'll accept any password for demo@example.com
  if (email === 'demo@example.com') {
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  }
  
  throw new Error('Invalid email or password');
}

export async function mockRegister(email: string, name: string) {
  await delay(500);
  
  if (db.users.some(u => u.email === email)) {
    throw new Error('An account with this email already exists');
  }
  
  const newUser = {
    id: crypto.randomUUID(),
    email,
    name,
    role: 'member',
    communities: ['default'],
    createdAt: new Date().toISOString(),
  };
  
  db.users.push(newUser);
  localStorage.setItem('user', JSON.stringify(newUser));
  return newUser;
}

export async function mockGetCurrentUser() {
  await delay(200);
  const storedUser = localStorage.getItem('user');
  
  if (!storedUser) {
    return null;
  }
  
  try {
    const user = JSON.parse(storedUser);
    const dbUser = db.users.find(u => u.id === user.id);
    return dbUser || null;
  } catch {
    localStorage.removeItem('user');
    return null;
  }
}