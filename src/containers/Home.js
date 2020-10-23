import React, {useState, useEffect} from "react";
import { useAppContext } from "../libs/contextLib";
import { onError } from "../libs/errorLib";
import { PageHeader, ListGroup, ListGroupItem } from "react-bootstrap";
import "./Home.css";
import { API } from "aws-amplify";
import { LinkContainer } from "react-router-bootstrap";


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
    } catch (e) {
      onError(e);
    }

    setIsLoading(false);
  }

  onLoad();
  }, [isAuthenticated]);

  function loadDropbox() {
   return API.get("dropbox", "/dropbox");
  } 
  function renderDropboxList(dropbox) {
  return [{}].concat(dropbox).map((dropbox, i) =>
    i !== 0 ? (
      <LinkContainer key={dropbox.fileId} to={`/dropbox/${dropbox.fileId}`}>
        <ListGroupItem header={dropbox.content.trim().split("\n")[0]}>
          {"Created: " + new Date(dropbox.createdAt).toLocaleString()}
        </ListGroupItem>
      </LinkContainer>
    ) : (
      <LinkContainer key="new" to="/dropbox/new">
        <ListGroupItem>
          <h4>
            <b>{"\uFF0B"}</b> Upload a new file!!!
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
        <p>Fun with Files</p>
      </div>
  );
  }
  function renderDropbox() {
    return (
      <div className="dropbox">
        <PageHeader>Your Files</PageHeader>
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

