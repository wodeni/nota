import React from "react";
import { createContext, useContext } from "react";

import { DocumentContext } from "./document";

interface AuthorAffiliation {
  institution?: string;
  country?: string;
}

let AffiliationContext = createContext<AuthorAffiliation>({});

interface AuthorData {
  name?: string;
  affiliations?: AuthorAffiliation[];
}

let InlineError: React.FC = ({ children }) => <span className="inline-error">{children}</span>;

let AuthorContext = createContext<AuthorData>({});

export let Institution: React.FC<{ value: string }> = ({ value }) => {
  let ctx = useContext(AffiliationContext);
  ctx.institution = value;
  return <></>;
};

export let Affiliation: React.FC = ({ children }) => {
  let auth_ctx = useContext(AuthorContext);
  let aff_ctx: AuthorAffiliation = {};
  let Inner = () => {
    if (!auth_ctx.affiliations) {
      auth_ctx.affiliations = [];
    }
    auth_ctx.affiliations.push(aff_ctx);
    return <></>;
  };
  return (
    <>
      <AffiliationContext.Provider value={aff_ctx}>{children}</AffiliationContext.Provider>
      <Inner />
    </>
  );
};

export let Name: React.FC<{ value: string }> = ({ value }) => {
  let ctx = useContext(AuthorContext);
  ctx.name = value;
  return <></>;
};

export let Author: React.FC = ({ children }) => {
  let ctx: AuthorData = {};
  let Inner = () => (
    <div className="author">
      {ctx.name ? (
        <span className="author-name">{ctx.name}</span>
      ) : (
        <InlineError>No author name!</InlineError>
      )}
      {ctx.affiliations ? (
        <span className="author-affiliation">
          ,{" "}
          {ctx.affiliations.map((affiliation, i) => (
            <span key={i}>
              {affiliation.institution ? affiliation.institution : null}
              {affiliation.country ? <>, {affiliation.country}</> : null}
            </span>
          ))}
        </span>
      ) : null}
    </div>
  );
  return (
    <>
      <AuthorContext.Provider value={ctx}>{children}</AuthorContext.Provider>
      <Inner />
    </>
  );
};

export let Authors: React.FC = ({ children }) => {
  let ctx = useContext(DocumentContext);
  return (
    <div className="authors">
      {ctx.anonymous ? (
        <div className="author">
          <span className="author-name">Anonymous author(s)</span>
        </div>
      ) : (
        children
      )}
    </div>
  );
};

export let Title: React.FC = ({ children }) => <h1 className="document-title">{children}</h1>;

export let Abstract: React.FC = ({ children }) => <div className="abstract">{children}</div>;
