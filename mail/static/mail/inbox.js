document.addEventListener('DOMContentLoaded', function() {
  // Create section for displaying the emails
  let emailSection = document.createElement("div");
  emailSection.setAttribute("id", "email-view");
  document.body.append(emailSection);

  // By default, load the inbox
  load_mailbox('inbox');

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

});

function compose_email(email) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').innerHTML = "";
  document.querySelector('#compose-view').style.display = 'block';

  // Autofill email fields if replying to email
  if (email.id !== undefined) {
    document.querySelector('#compose-recipients').value = email.sender;
    let reply_subject = email.subject
    if (reply_subject.slice(0,4) !== "Re: ") {
      reply_subject = `Re: ${reply_subject}`
    }
    document.querySelector('#compose-subject').value = reply_subject;
    const reply_body = `\n ${"-".repeat(60)} \n On ${email.timestamp} ${email.sender} wrote:` +
    `\n    ${email.body}`;
    document.querySelector('#compose-body').value = reply_body;
  }
  // Otherwise clear out composition fields
  else {
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
  }

  // Check for send email button
  document.querySelector("#compose-form").onsubmit = send_email
}


function load_mailbox(mailbox) {

  // Delay loading mailbox to allow DB to sync after changes
  setTimeout(open_mailbox, 50, mailbox);

  function open_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').innerHTML = "";

    fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // const loaded_emails = document.querySelector("#emails-view");
    let email_table = document.createElement("table");
    let header_row = document.createElement("tr");

    // Populate Header rows
    for (const header_name of ['sender', "subject", "date"]) {
      let header = document.createElement("th");
      header.setAttribute('id', header_name)
      header.innerText = header_name.toLocaleUpperCase();
      header_row.append(header);
      let width_dict = {'sender': '20%', 'subject': "40%", 'date': "25%"};
      header.style.width = width_dict[header_name];
    }
    email_table.style.width = '750px';
    email_table.append(header_row);



    emails.forEach(email => {
      let email_row = document.createElement("tr");
      for (const row_content of [email.sender, email.subject, email.timestamp, "archive_button"]) {
        let row_item = document.createElement("td");

        // Add email information to table columns
        if (row_content !== "archive_button") {
          row_item.innerText = row_content;
          row_item.addEventListener('click', () => open_email(email.id));
          email_row.append(row_item);
        }
        // Add archive/'Move to mailbox' button if not in sent folder
        else if (mailbox !== "sent") {
          let archive_button = document.createElement("button");
          // let archive_col = document.createElement('td')
          archive_button.setAttribute("id", "archive-button");
          if (mailbox === "inbox") {
            archive_button.innerText = "Archive"
          }
          else {
            archive_button.innerText = "Unarchive"
          }
          archive_button.addEventListener('click', () => toggle_archive_read(email.id, "archived"));
          row_item.append(archive_button);
          Object.assign(row_item.style, {textAlign:"right", height: "20px"});
          email_row.append(row_item);
        };
      }

      // Add Styling
      email_row.style.border = '3px solid lightgray';
      if (email.read === false){
        email_row.style.backgroundColor = "gray";
      }
      else {
        email_row.style.backgroundColor = "white";
      }


      email_table.append(email_row);
    });
    document.querySelector("#emails-view").append(email_table);

    // ... do something else with emails ...
  });

  }
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}


function open_email(email_id) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then (email => {

    // Mark email as read if it isn't
    if (email.read === false){
      toggle_archive_read(email.id, 'read');
    }

    console.log(email.body);
    console.log(`This ${email.id}-"${email.subject}" has been clicked`);

    const div = document.createElement("div");
    div.innerHTML = `<p><b>Sender:</b> ${email.sender} (${email.timestamp})</p> 
              <hr style="margin: 0px ">
              <p style="margin: 0px;"><b>Recipients:</b> ${email.recipients}</p>
              
              <p style="border-bottom: 3px "><b>Subject: </b>${email.subject}</p>
                            <hr>
              <p style="white-space: pre-wrap">${email.body}</p>
                            <hr>
              <button id="reply">Reply</button>`;
    // div.style.border = "4px";
    div.style.paddingLeft = "50px"
    div.style.paddingTop = "0px"
    document.querySelector("#email-view").append(div);


    document.querySelector("#reply").addEventListener("click", () =>
        compose_email(email));

  });
}



function send_email() {
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: document.querySelector("#compose-recipients").value,
        subject: document.querySelector("#compose-subject").value,
        body: document.querySelector("#compose-body").value,
    })
  })

  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      // alert("email sent");
  });

  // Load sent mailbox
  load_mailbox('sent');

  // Prevent form from submitting
  return false;

}

function toggle_archive_read(id, archive_read) {
  // Function to mark email as read, or Archived/Unarchived
  console.log("attempted to archive/mark read")

  // Get the email
  fetch(`/emails/${id}`)
      .then(response => response.json())
      .then(email => {
        let archive_read_state = email[archive_read]
        console.log(`Email ${id} is current archived ${archive_read_state}`)
        fetch(`/emails/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
            [archive_read]: !archive_read_state
          })
        })
      })

  // Load inbox if email is archived
  if (archive_read === "archived") {
      load_mailbox("inbox")
  }

}

