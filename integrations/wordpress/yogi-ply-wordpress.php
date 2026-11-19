<?php
/**
 * Plugin Name: Yogi_PLY — Universal Liquid Glass Video Player
 * Description: Embed cinematic liquid glass video players into WordPress posts and pages using shortcodes.
 * Version: 1.0.0
 * Author: Shiv Yogi
 * Author URI: https://github.com/shiv-yogi19/Yogi_PLY
 * License: MIT
 */

if (!defined('ABSPATH')) {
    exit;
}

function yogi_ply_enqueue_scripts() {
    wp_enqueue_style('yogi-ply-css', 'https://cdn.jsdelivr.net/npm/yogi-ply@1.0.0/dist/yogi-ply.min.css', array(), '1.0.0');
    wp_enqueue_script('yogi-ply-js', 'https://cdn.jsdelivr.net/npm/yogi-ply@1.0.0/dist/yogi-ply.min.js', array(), '1.0.0', true);
}
add_action('wp_enqueue_scripts', 'yogi_ply_enqueue_scripts');

/**
 * Shortcode: [yogi_ply src="video.mp4" poster="thumb.jpg" theme="liquid-glass" title="My Video"]
 */
function yogi_ply_shortcode($atts) {
    $a = shortcode_atts(array(
        'src' => '',
        'poster' => '',
        'theme' => 'liquid-glass',
        'layout' => 'cinematic',
        'title' => 'Video',
        'autoplay' => 'false',
        'muted' => 'false',
        'loop' => 'false'
    ), $atts);

    static $instance_id = 0;
    $instance_id++;
    $player_id = 'yogi-ply-wp-' . $instance_id;

    $src = esc_url($a['src']);
    $poster = esc_url($a['poster']);
    $theme = esc_attr($a['theme']);
    $layout = esc_attr($a['layout']);
    $title = esc_attr($a['title']);
    $autoplay = ($a['autoplay'] === 'true') ? 'true' : 'false';
    $muted = ($a['muted'] === 'true') ? 'true' : 'false';
    $loop = ($a['loop'] === 'true') ? 'true' : 'false';

    ob_start();
    ?>
    <div class="yogi-ply-wp-container" style="max-width:960px; margin:20px auto;">
        <div id="<?php echo esc_attr($player_id); ?>"></div>
    </div>
    <script>
    document.addEventListener('DOMContentLoaded', function() {
        if (window.YogiPLY && window.YogiPLY.Player) {
            new window.YogiPLY.Player('#<?php echo esc_js($player_id); ?>', {
                source: '<?php echo esc_js($src); ?>',
                poster: '<?php echo esc_js($poster); ?>',
                theme: '<?php echo esc_js($theme); ?>',
                layout: '<?php echo esc_js($layout); ?>',
                title: '<?php echo esc_js($title); ?>',
                autoplay: <?php echo $autoplay; ?>,
                muted: <?php echo $muted; ?>,
                loop: <?php echo $loop; ?>
            });
        }
    });
    </script>
    <?php
    return ob_get_clean();
}
add_shortcode('yogi_ply', 'yogi_ply_shortcode');
