import React, { useState, useContext, useEffect, forwardRef } from "react";
import _ from "lodash";
import classNames from "classnames";
import { makeObservable, observable, action } from "mobx";
import { observer } from "mobx-react";

import { Container } from "./utils";
import { ScrollPlugin } from "./scroll";
import { Tooltip } from "./tooltip";
import { Plugin, Pluggable, usePlugin } from "./plugin";

export interface DefinitionData {
  Tooltip: React.FC | null;
  Label: React.FC | null;
}

class DefinitionsData extends Pluggable {
  @observable.shallow defs: { [name: string]: DefinitionData } = {};
  @observable def_mode: boolean = false;
  @observable used_definitions: Set<string> = new Set();
  stateful = true;

  constructor() {
    super();
    makeObservable(this);
  }

  register_use = action((name: string) => {
    this.used_definitions.add(name);
  })

  get_definition = (name: string): DefinitionData | undefined => {
    return this.defs[name];
  };

  add_definition = action((name: string, def: DefinitionData) => {
    if (!(name in this.defs)) {
      this.defs[name] = def;
    }
  });

  init() {
    let on_keydown = action(({ key }: KeyboardEvent) => {
      if (key === "Alt") {
        this.def_mode = true;
      }
    });

    let on_keyup = action(({ key }: KeyboardEvent) => {
      if (key == "Alt") {
        this.def_mode = false;
      }
    });
  
    useEffect(() => {
      window.addEventListener("keydown", on_keydown);
      window.addEventListener("keyup", on_keyup);
      return () => {
        window.removeEventListener("keydown", on_keydown);
        window.removeEventListener("keyup", on_keyup);
      };
    }, []);
  }
}

export let DefinitionsPlugin = new Plugin(DefinitionsData);

interface DefinitionProps {
  name?: string;
  block?: boolean;
  Tooltip?: React.FC | null;
  Label?: React.FC;
}

let name_to_id = (name: string): string => `def-${name.replace(':', '-')}`;

export let DefinitionAnchor: React.FC<{ name: string; block?: boolean }> = props => (
  <Container block={props.block} id={name_to_id(props.name)}>
    {props.children}
  </Container>
);

export let Definition: React.FC<DefinitionProps> = props => {
  let ctx = usePlugin(DefinitionsPlugin);
  let [name] = useState(props.name || _.uniqueId());

  useEffect(() => {
    let Tooltip =
      typeof props.Tooltip !== "undefined" ? props.Tooltip : () => <>{props.children}</>;
    let Label = props.Label || null;
    ctx.add_definition(name, { Tooltip, Label });
  }, []);

  return props.children ? (
    <DefinitionAnchor block={props.block} name={name}>
      {props.children}
    </DefinitionAnchor>
  ) : null;
};

interface RefProps {
  name: string;
  block?: boolean;
  nolink?: boolean;
}


export let Ref: React.FC<RefProps> = observer(props => {
  let ctx = usePlugin(DefinitionsPlugin);
  let scroll_plugin = usePlugin(ScrollPlugin);
  useEffect(() => {
    ctx.register_use(props.name);
  }, []);
  
  let def = ctx.get_definition(props.name);  
  if (!def) {
    return <span className="error">{props.name}</span>;
  }

  let on_click: React.MouseEventHandler = e => {
    e.preventDefault();
    e.stopPropagation();

    scroll_plugin.scroll_to(name_to_id(props.name));
  };

  let inner: JSX.Element = props.children ? (
    <>{props.children}</>
  ) : def.Label ? (
    <def.Label />
  ) : (
    <span className="error">No children or label for "{props.name}"</span>
  );

  let scroll_event = def.Tooltip ? "onDoubleClick" : "onClick";
  let event_props = { [scroll_event]: on_click };

  let Inner = forwardRef<HTMLDivElement>((inner_props, ref) => (
    <Container
      ref={ref}
      block={props.block}
      className={classNames("ref", {
        nolink: props.nolink,
      })}
      {...inner_props}
      {...event_props}
    >
      {inner}
    </Container>
  ));

  if (def.Tooltip) {
    return <Tooltip Inner={Inner} Popup={def.Tooltip} />;
  } else {
    return <Inner />;
  }
});
