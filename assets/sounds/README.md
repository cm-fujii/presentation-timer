# アラート音ファイル

このディレクトリには、タイマーのアラート音ファイルを配置します。

## 必要なファイル

- `gong.mp3` - 銅鑼のアラート音
- `bell.mp3` - ベルのアラート音（TODO: 適切なベル音に置き換える）

## 現在使用している音源

### 銅鑼（gong.mp3）

現在のアラート音は、以下のサイトより提供されているフリー効果音を使用しています：

- **提供元**: [効果音 G-SOZAI](https://koukaon.g-sozai.com/)
- **音源ページ**: [カーソル移動4](https://koukaon.g-sozai.com/se-236.html)
- **ライセンス**: フリー素材（商用利用可）

### ベル（bell.mp3）

**TODO**: 適切なベルの音源を追加してください。

推奨音源：

- [Freesound - Bell sounds](https://freesound.org/search/?q=bell)
- [効果音 G-SOZAI - ベル](https://koukaon.g-sozai.com/)

## 要件

- **形式**: MP3 (推奨) または WAV
- **サイズ**: 50KB以下推奨
- **長さ**: 1-3秒推奨
- **音量**: 適度な音量（ピーク -6dB以下）

## 推奨音源

1. **フリー音源サイト**:
   - [Freesound](https://freesound.org/)
   - [SoundBible](https://soundbible.com/)
   - [Zapsplat](https://www.zapsplat.com/)
   - [効果音 G-SOZAI](https://koukaon.g-sozai.com/)

2. **自作**:
   - Audacityなどの音声編集ソフトで作成
   - シンプルなビープ音や通知音

## 配置方法

```bash
# ベルの音声ファイルをこのディレクトリにコピー
cp /path/to/your/bell-sound.mp3 assets/sounds/bell.mp3
```

## テスト

音声ファイルを配置後、以下で確認:

```bash
# 開発サーバー起動
npm run dev

# ブラウザで http://localhost:5173 を開く
# 設定パネルでアラート音を選択し、プレビューボタンで再生確認
```

## 注意事項

- **著作権**: 使用する音声ファイルのライセンスを確認してください
- **ブラウザ対応**: MP3はすべてのモダンブラウザでサポートされています
- **Safari制約**: ユーザーインタラクション（ボタンクリック等）後でないと音声は再生されません
