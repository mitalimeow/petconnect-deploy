const fetch = require('node-fetch');

async function testPost() {
  const payload = {
    petName: 'Test Buddy',
    animalType: 'Dogs',
    location: 'Mumbai',
    age: 5,
    color: 'Golden',
    image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1FVWV1hZWmNkZWZnaGlqc3R1dnd4eXqGhcXl5iZmpoaSlpaWpvm56umh4iJiouNjkeJicoSChYXG19lZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/9o-ADAMBAAIRAxEAPwD3+iiigD//2Q==',
    contactPhone: '1234567890'
  };

  try {
    const res = await fetch('http://localhost:5000/api/adoption', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        // 'Authorization': 'Bearer <TOKEN>' // Need a valid token
      },
      body: JSON.stringify(payload)
    });
    
    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', data);
  } catch (err) {
    console.error(err);
  }
}

testPost();
