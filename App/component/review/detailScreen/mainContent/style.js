import { WINDOW_WIDTH, WINDOW_HEIGHT } from '@gorhom/bottom-sheet';
import { StyleSheet } from 'react-native';
import { colors, toSize } from 'config/globalStyle';

export const styles = StyleSheet.create({
  memberContainer: {
    flexDirection: 'row',
    // justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: toSize(32),
    marginBottom: toSize(6),
  },
  paddingContent: {
    paddingHorizontal: toSize(16),
    paddingTop: toSize(12),
  },
  memberImage: {
    width: toSize(32),
    height: toSize(32),
    borderRadius: 999,
    marginRight: toSize(5),
  },

  mainImage: {
    width: WINDOW_WIDTH - toSize(32),
    height: ((WINDOW_WIDTH - toSize(32)) * 229) / 343,
  },
  title: {
    width: WINDOW_WIDTH - toSize(32),
    marginTop: toSize(12),
    flexDirection: 'row',
  },
  titleText: {
    marginLeft: toSize(6),
    width: WINDOW_WIDTH - toSize(50),
    flexWrap: 'nowrap',
    marginBottom: toSize(6),
    lineHeight: toSize(24),
  },
  dateCommentBookmark: {
    flexDirection: 'row',
    marginTop: toSize(4),
    height: toSize(20),
    alignItems: 'center',
  },
  marginRight4: {
    marginRight: toSize(4),
  },
  marginRight8: {
    marginRight: toSize(8),
  },
  content: {
    marginTop: toSize(6),
    marginBottom: toSize(12),
  },
  commentLengthView: {
    height: toSize(43),
    borderTopWidth: toSize(1),
    // borderBottomWidth: toSize(1),
    borderColor: colors.ColorF4F4F4,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: toSize(16),
  },

  footerText: {
    width: toSize(30),
    height: toSize(22),
  },
  footerBackground: {
    position: 'absolute',
    right: toSize(8),
    top: toSize(12),
    backgroundColor: 'white',
    opacity: 0.42,
    justifyContent: 'center',
    alignItems: 'center',
    width: toSize(32),
    height: toSize(18),
    borderRadius: 999,
    zIndex: 99,
  },
  imageHeader: {
    padding: 111,
    backgroundColor: 'yellow',
  },
  imageModalClose: {
    padding: toSize(6),
  },
  modalRelative: {
    position: 'relative',
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    zIndex: 938,
  },
  modalClose: {
    position: 'absolute',
    top: toSize(50),
    left: toSize(13),
    zIndex: 1000,
    padding: toSize(8),
  },
  bottomIndicator: {
    position: 'absolute',
    bottom: toSize(56),
    left: (WINDOW_WIDTH - toSize(30)) / 2,
  },
  modalImage: {
    width: '100%',
    height: '74%',
    marginTop: '23%',
  },
  modalContainer: {
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    // position: 'relative',
    backgroundColor: colors.Color2D2F30,
  },
  carousel: {
    backgroundColor: colors.Color2D2F30,
  },
  imageContainer: {
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
