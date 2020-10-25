import React, {useState, useEffect} from "react";
import { useAppContext } from "../libs/contextLib";
import { onError } from "../libs/errorLib";
import { ButtonToolbar, PageHeader, ListGroup, ListGroupItem, Button } from "react-bootstrap";
import "./Home.css";
import { API } from "aws-amplify";
import { LinkContainer} from "react-router-bootstrap";
import LoaderButton from "../components/LoaderButton";

import { Nav, Navbar, NavItem } from "react-bootstrap";

export default function Home() {

  const [dropbox, setDropbox] = useState([]);
  const { isAuthenticated } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
  async function onLoad() {
    if (!isAuthenticated) {
      return;
    }

    try {
      const dropbox = await loadDropbox();
      setDropbox(dropbox);
        
        const { content, attachment } = dropbox;

        if (attachment) {
          dropbox.attachmentURL = await Storage.vault.get(attachment);
        }
    } catch (e) {
      onError(e);
    }

    setIsLoading(false);
  }

  onLoad();
  }, [isAuthenticated]);
  
  function formatFilename(str) {
    return str.replace(/^\w+-/, "");
  }

  function loadDropbox() {
   return API.get("dropbox", "/dropbox");
  } 
  function renderDropboxList(dropbox) {
  return [{}].concat(dropbox).map((dropbox, i) =>
    i !== 0 ? (
      <LinkContainer key={dropbox.fileId} to={`/dropbox/${dropbox.fileId}`}>
        <ListGroupItem header={formatFilename(dropbox.attachment)}>
	<div>
        {"Decription: " + dropbox.content.trim().split("\n")[0]}
        </div>
	<div>
        	{"Created: " + new Date(dropbox.createdAt).toLocaleString()}
        </div>
	</ListGroupItem>
      </LinkContainer>
    ) : (
      <LinkContainer key="new" to="/dropbox/new">
        <ListGroupItem>
          <h4>
            <img src="./favicon-32x32.png"/> Upload a new file!!!
          </h4>
        </ListGroupItem>
      </LinkContainer>
    )
  );
  } 
  
  function renderLander() {
  return (
      <div className="lander">
        <h1>Dropbox</h1>
	<img src="./android-chrome-512x512.png" width="200" height="200" />
        <h3>Fun with Files</h3>
        <Button
   	  bsSize="large"
          bsStyle="success"
          href="/login"
	 >
  	  Login
	 </Button> {''} 
        <Button
   	  bsSize="large"
          bsStyle="info"
          href="/signup"
	 >
  	  Signup
	 </Button>
      </div>
  );
  }
  function renderDropbox() {
    return (
      <div className="dropbox">
        <PageHeader>Uploaded Files</PageHeader>
        <ListGroup>
          {!isLoading && renderDropboxList(dropbox)}
        </ListGroup>
      </div>
    );
  }

  return (
    <div className="Home">
      {isAuthenticated ? renderDropbox() : renderLander()}
    </div>
  );
}

