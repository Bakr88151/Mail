document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', send_email);
  archive_button = document.querySelector('#archive');
  archive_button.addEventListener('click', () => archive(archive_button.dataset.email_id));
  document.querySelector('#reply').addEventListener('click', reply);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#show-email').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#show-email').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(result => {
    result.forEach(item => {
      const container = document.createElement('div');
      container.className = 'email_container';
      container.setAttribute('data-email_id', item.id)
      container.setAttribute('id', 'email')
      if (item.read == true){container.style.backgroundColor = 'gray';}else{container.style.backgroundColor = 'white';}
      const sender = document.createElement('div');
      sender.className = 'sender';
      sender.innerHTML = item.sender;
      const subject = document.createElement('div');
      subject.innerHTML = item.subject;
      const timestamp = document.createElement('div');
      timestamp.className = 'timestamp';
      timestamp.innerHTML = item.timestamp;
      container.append(sender);
      container.append(subject);
      container.append(timestamp);
      document.querySelector('#emails-view').append(container)
      container.addEventListener('click', function() {show_email(item.id)})
    })
  })

}

function send_email() {
  console.log("submmit spotted")
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value,
  })
  })
  .then(response => response.json())
  .then(result => {
    // Print result
    console.log(result);
  });
  load_mailbox('sent')
  event.preventDefault()
}

function show_email(id) {
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(result => {
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#show-email').style.display = 'block';
    document.querySelector('#from').innerHTML = result.sender;
    document.querySelector('#to').innerHTML = result.recipients;
    document.querySelector('#subject').innerHTML = result.subject;
    document.querySelector('#timestamp').innerHTML = result.timestamp;
    document.querySelector('#body').innerHTML = result.body;
    const user = document.querySelector('#user').value;
    const archive_button = document.querySelector('#archive');
    archive_button.setAttribute('data-email_id', id)
    if (user != result.sender){
      archive_button.style.display = 'block';
      if(result.archived == false){archive_button.innerHTML = 'Archive';}else{archive_button.innerHTML = 'Unarchive';}
    }
    else{archive_button.style.display = 'none'}
  })
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })
}

function archive(id) {
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    if(email.archived == false){
      fetch(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: true
        })
      })
    }
    else{
      fetch(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: false
        })
      })
    }
  })
  load_mailbox('inbox');
}

function reply() {
  console.log('reply button clicked')
  const recipients = document.querySelector('#from').innerHTML;
  const subject = document.querySelector('#subject').innerHTML;
  const body = document.querySelector('#body').innerHTML;
  const timestamp = document.querySelector('#timestamp').innerHTML;
  compose_email()
  document.querySelector('#compose-recipients').value = recipients;
  if (subject.startsWith('Re: ')){document.querySelector('#compose-subject').value=subject}else{document.querySelector('#compose-subject').value=`Re: ${subject}`}
  document.querySelector('#compose-body').value = `On ${timestamp} ${recipients} wrote: ${body}\n`;
}
