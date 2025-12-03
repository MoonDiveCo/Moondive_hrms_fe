import React from "react";
import PropTypes from "prop-types";
import styles from "./index.module.css";
import Image from "next/image";

const MDNote = ({ type, icon, children, textStyle, animation, inlineCSS }) => {
  // Determine the icon to use
  const noteIcon = icon && icon.svg;

  // Default background color based on type
  const defaultBgColors = {
    primary: "rgb(204,229,255)",
    secondary: "rgb(226,227,229)",
    success: "rgb(212,237,218)",
    danger: "rgb(248,215,218)",
    warning: "rgb(255,243,205)",
    info: "rgb(209,236,241)",
    light: "rgb(254,254,254)",
    dark: "rgb(214,216,217)",
  };

  const textColors = {
    primary: "rgb(53,64,137)",
    secondary: "rgb(91,82,73)",
    success: "rgb(43,98,46)",
    danger: "rgb(146,28,56)",
    warning: "rgb(134,105,44)",
    info: "rgb(92,92,108)",
    light: "rgb(170,142,136)",
    dark: "rgb(42,40,33)",
  };

  const borderColors = {
    primary: "rgb(116,226,225)",
    secondary: "rgb(206, 207, 209)",
    success: "rgb(184, 232, 194)",
    danger: "rgb(246,202,207)",
    warning: "rgb(255, 226, 160)",
    info: "rgb(194, 232, 237)",
    light: "rgb(245, 245, 245)",
    dark: "rgb(202,204,206)",
  };

  const defaultBorderColor = borderColors[type];
  const defaultTextColor = textColors[type];
  const finalInlineCSS = {
    backgroundColor: inlineCSS && inlineCSS.backgroundColor ? inlineCSS.backgroundColor : defaultBgColors[type],
    height: inlineCSS && inlineCSS.height ? inlineCSS.height : 'auto',
    width: inlineCSS && inlineCSS.width ? inlineCSS.width : '100%',
    border: inlineCSS && inlineCSS.border ? inlineCSS.border : `0.1px solid ${defaultBorderColor}`, // Default border
    borderRadius: inlineCSS && inlineCSS.borderRadius ? inlineCSS.borderRadius : '5px',
    justifyContent: inlineCSS && inlineCSS.justifyContent ? inlineCSS.justifyContent : 'start',
    fontSize: inlineCSS && inlineCSS.textSize ? inlineCSS.textSize : '15px',
    padding: inlineCSS && inlineCSS.padding ? inlineCSS.padding : '10px',
    color: inlineCSS && inlineCSS.fontColor ? inlineCSS.fontColor : defaultTextColor,
    fontWeight: inlineCSS && inlineCSS.fontWeight ? inlineCSS.fontWeight : '200',
    display: "flex",
    alignItems: "center",
  };

  const iconRightStyle = {
    marginRight: "10px",
  };
  const iconLeftStyle = {
    marginLeft: "10px",
  };

  return (
    <div className={`note ${type} ${styles[animation]}`} style={finalInlineCSS}>
      <div className={`flex w-full`} style={{ 'justifyContent': `${finalInlineCSS.justifyContent}` }}>
        {icon && !icon.postFix && (<div className={styles.iconDiv} style={{ marginRight: '7px' }}>
          <Image fill style={iconRightStyle} width={icon.width} height={icon.height} src={noteIcon} alt={`icon`} />
        </div>)
        }
        <p style={{ ...textStyle, color: finalInlineCSS.color, fontWeight: finalInlineCSS.fontWeight, paddingLeft:'10px', paddingRight:'10px'}}>{children}</p>
        {icon && icon.postFix && (<div className={styles.iconDiv} style={{ marginTop: '2px' }}>
          <Image fill style={iconLeftStyle} width={icon.width} height={icon.height} src={noteIcon} alt={`icon`} />
        </div>)
        }
      </div>
    </div>
  );
};

MDNote.propTypes = {
  type: PropTypes.oneOf([
    "primary",
    "secondary",
    "success",
    "danger",
    "warning",
    "info",
    "light",
    "dark",
  ]).isRequired,
  icon: PropTypes.shape({
    svg: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    width: PropTypes.string.isRequired,
    postFix: PropTypes.bool,
  }),
  children: PropTypes.node.isRequired,
  textStyle: PropTypes.object,
  animation: PropTypes.oneOf([
    "fade",
    "top",
    "bottom",
    "left",
    "right",
    "zoom",
    "zoom-out",
  ]).isRequired,
  inlineCSS: PropTypes.shape({
    backgroundColor: PropTypes.string,
    height: PropTypes.string,
    width: PropTypes.string,
    border: PropTypes.string,
    borderRadius: PropTypes.string,
    textAlign: PropTypes.string,
    textSize: PropTypes.string,
    padding: PropTypes.string,
    textColors: PropTypes.string,
  }),
};

MDNote.defaultProps = {
  textStyle: {},
  animation: "fade",
};

export default MDNote;
