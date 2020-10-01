import { Component } from "preact";
import React from "preact/compat";
import { SEOModelContent } from "../containers/modal/seoModelContent";

export class Modal extends Component<any, any> {
  render() {
    const { state, updateState } = this.props;
    return (
      state && (
        <div id="modal-overlay" style={styles.modalOverlay}>
          <SEOModelContent handleClick={() => updateState(null)} />
        </div>
      )
    );
  }
};

const styles = {
  modalOverlay: {
    position: "absolute",
    width: "100vw",
    height: "100vh",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    background: "rgba(14, 14, 14, 0.9)",
  },
};
