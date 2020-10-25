import React, { useRef, useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { API, Storage } from "aws-amplify";
import { onError } from "../libs/errorLib";
import config from "../config";
import { FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import LoaderButton from "../components/LoaderButton";
import "./DropboxEdit.css";
import { s3Upload } from "../libs/awsLib";

export default function DropboxEdit() {
  
  const file = useRef(null);
  const { id } = useParams();
  const history = useHistory();
  const [dropbox, setDropbox] = useState(null);
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);



  useEffect(() => {
    function loadDropbox() {
      return API.get("dropbox", `/dropbox/${id}`);
    }

    async function onLoad() {
      try {
        const dropbox = await loadDropbox();
        const { content, attachment } = dropbox;

        if (attachment) {
          dropbox.attachmentURL = await Storage.vault.get(attachment);
        }

        setContent(content);
        setDropbox(dropbox);
      } catch (e) {
        onError(e);
      }
    }

    onLoad();
  }, [id]);

    function validateForm() {
  return content.length > 0;
}

function formatFilename(str) {
  return str.replace(/^\w+-/, "");
}

function handleFileChange(event) {
  file.current = event.target.files[0];
}


function saveDropbox(dropbox) {
  return API.put("dropbox", `/dropbox/${id}`, {
    body: dropbox
  });
}

async function handleSubmit(event) {
  let attachment;

  event.preventDefault();

  if (file.current && file.current.size > config.MAX_ATTACHMENT_SIZE) {
    alert(
      `Please pick a file smaller than ${
        config.MAX_ATTACHMENT_SIZE / 1000000
      } MB.`
    );
    return;
  }

  setIsLoading(true);

  try {
    if (file.current) {
      Storage.vault.remove(dropbox.attachment); 
      attachment = await s3Upload(file.current);
    }

    await saveDropbox({
      content,
      attachment: attachment || dropbox.attachment
    });
    history.push("/");
  } catch (e) {
    onError(e);
    setIsLoading(false);
  }
}

function deleteDropbox() {
  Storage.vault.remove(dropbox.attachment); 
  return API.del("dropbox", `/dropbox/${id}`);
}

async function handleDelete(event) {
  event.preventDefault();

  const confirmed = window.confirm(
    "Confirm if you want to delete the file?"
  );

  if (!confirmed) {
    return;
  }

  setIsDeleting(true);

  try {
    await deleteDropbox();
    history.push("/");
  } catch (e) {
    onError(e);
    setIsDeleting(false);
  }
}

return (
  <div className="dropbox">
    {dropbox && (
      <form onSubmit={handleSubmit}>
        {dropbox.attachment && (
          <FormGroup>
            <ControlLabel>Update file below: (Max Allowed Size: 5MB)</ControlLabel>
            <FormControl.Static>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={dropbox.attachmentURL}
              >
                {formatFilename(dropbox.attachment)}
              </a>
            </FormControl.Static>
          </FormGroup>
        )}
        <FormGroup controlId="file">
          {!dropbox.attachment && <ControlLabel>Attachment</ControlLabel>}
          <FormControl onChange={handleFileChange} type="file" />
        </FormGroup>
        <FormGroup controlId="content">
          <ControlLabel>Update Description</ControlLabel>
          <FormControl
            value={content}
            type="text"
	    onChange={e => setContent(e.target.value)}
          />
        </FormGroup>
        <LoaderButton
          type="submit"
          bsSize="large"
          bsStyle="primary"
          isLoading={isLoading}
          disabled={!validateForm()}
        >
          Save
        </LoaderButton> {'  '}
        <LoaderButton
          bsSize="large"
          bsStyle="danger"
          onClick={handleDelete}
          isLoading={isDeleting}
        >
          Delete
        </LoaderButton>
      </form>
    )}
  </div>
);
}
