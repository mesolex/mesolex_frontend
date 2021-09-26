import * as React from 'react';

import AudioPlayer, { RHAP_UI } from 'react-h5-audio-player';

const MesolexAudioPlayer = ({ src }) => (
  <AudioPlayer
    autoPlayAfterSrcChange={false}
    src={src}
    showJumpControls={false}
    showDownloadProgress={false}
    showFilledProgress={false}
    customControlsSection={[RHAP_UI.MAIN_CONTROLS]}
    customProgressBarSection={[]}
    style={{
      display: 'inline-block',
      margin: '0 1em',
    }}
  />
);

export default MesolexAudioPlayer;