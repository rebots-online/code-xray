import React from "react";
import {makeStyles} from "@material-ui/core";
import Chip from "@material-ui/core/Chip";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import LinearProgress from "@material-ui/core/LinearProgress";
import Typography from "@material-ui/core/Typography";
import BrightnessAuto from "@material-ui/icons/BrightnessAuto";
import DoneAll from "@material-ui/icons/DoneAll";

// configuration
const DEFAULT_NO_LANGUAGES = [
  'XML', 'YAML', 'Dockerfile', 'Protocol Buffers', 'HTML', 'Bourne Shell', 'Markdown', 'CMake',
  'PowerShell', 'Windows Module Definition', 'DOS Batch', 'Pascal', 'MSBuild script'
];
const DEFAULT_EXCLUDE_LANGUAGES = true;

const useStyles = makeStyles(theme => ({
  langChip: {
    margin: theme.spacing(0.5),
  },
  linearProgress: {
    backgroundColor: theme.palette.grey.A100,
  },
}));

export function getDefaultExclusions(langStatList) {
  return DEFAULT_EXCLUDE_LANGUAGES ? langStatList.map(l => l.name).filter(l => DEFAULT_NO_LANGUAGES.includes(l)) : [];
}

/**
 * Usage: <LanguagesChips langStatList={statsList} noLanguages={languagesList} onChange={callback}/>
 * @param props
 */
export default props => {
  const classes = useStyles();
  const {langStatList, noLanguages, onChange} = props;

  function excludeLanguage(name) {
    onChange(noLanguages.concat(name));
  }

  function includeLanguage(name) {
    onChange(noLanguages.filter(l => l !== name));
  }

  function excludeAuto() {
    onChange(getDefaultExclusions(langStatList));
  }

  function resetIncluded() {
    onChange(langStatList.map(l => l.name));
  }

  function resetExcluded() {
    onChange([]);
  }

  const activeLS = langStatList.filter(l => !noLanguages.includes(l.name));
  const inactiveLS = langStatList.filter(l => noLanguages.includes(l.name));

  // statistics (excluded files and code lines)
  const activeCode = activeLS.reduce((sum, l) => sum + l.code, 0);
  const inactiveCode = inactiveLS.reduce((sum, l) => sum + l.code, 0);
  const activeFiles = activeLS.reduce((sum, l) => sum + l.files, 0);
  const inactiveFiles = inactiveLS.reduce((sum, l) => sum + l.files, 0);
  const activeCodeRatio = activeCode > 0 ? 100 * (1 - inactiveCode / (activeCode + inactiveCode)) : 0;
  const activeFilesRatio = activeFiles > 0 ? 100 * (1 - inactiveFiles / (activeFiles + inactiveFiles)) : 0;
  const noExclusion = inactiveCode === 0;
  const nothingLeft = activeCode === 0;

  return (
    <Grid container spacing={2}>
      <Grid item sm={12} md={6}>
        <Typography align="center">
          Active languages &nbsp;
          <IconButton href='' onClick={excludeAuto}><BrightnessAuto/></IconButton>
          <IconButton href='' onClick={resetIncluded} disabled={nothingLeft}><DoneAll/></IconButton>
        </Typography>
        {activeLS.map(lang =>
          <Chip color="secondary" label={lang.name} onDelete={() => excludeLanguage(lang.name)}
                key={'lang-' + lang.name} component="div" className={classes.langChip}/>)}
      </Grid>
      <Grid item xs={12} md={6}>
        <Typography align="center">
          Disabled languages  &nbsp;
          <IconButton href='' onClick={resetExcluded} disabled={noExclusion}><DoneAll/></IconButton>
        </Typography>
        {inactiveLS.map(lang =>
          <Chip variant="outlined" label={lang.name} onDelete={() => includeLanguage(lang.name)}
                key={'no-lang-' + lang.name} component="div" className={classes.langChip}/>)}
      </Grid>
      <Grid item xs={12} style={{backgroundColor: 'white'}}>
        <Grid container alignItems="center">
          <Grid item xs={12} sm={5} md={4}>
            {noExclusion ? 'Code: 100% (' + activeCode + ')' : (nothingLeft ? 'Nothing left' :
              'Removing ' + inactiveCode.toLocaleString() + ' lines of code (' + (100 - ~~(activeCodeRatio)) + '%)')}
          </Grid>
          <Grid item xs={12} sm={5} md={8}>
            <LinearProgress color="secondary" variant="determinate" value={activeCodeRatio}
                            className={classes.linearProgress}/>
          </Grid>
          <Grid item xs={12} sm={5} md={4}>
            {noExclusion ? 'Files: 100% (' + activeFiles + ')' : (nothingLeft ? 'No files left' :
              'Removing ' + inactiveFiles.toLocaleString() + ' files (' + (100 - ~~(activeFilesRatio)) + '%)')}
          </Grid>
          <Grid item xs={12} sm={7} md={8}>
            <LinearProgress color="secondary" variant="determinate" value={activeFilesRatio}
                            className={classes.linearProgress}/>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}
