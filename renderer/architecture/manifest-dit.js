export const manifest = {
  "schemaVersion": "architecture-manifest-v0.4",
  "build": {
    "generator": "architecture-manifest-builder-v0.4.6",
    "inputDigests": {
      "references/bibliography.yaml": "abe9226586bfb64261c81b7756b7275c48a3a172a9a18b5f91f7acfd3145e374",
      "architectures/diffusion-transformer.yaml": "5d7c09d2a97999cd526241976db9881acc2499d98abbe3624520562a53510aad",
      "views/dit-semantic-zoom.view.yaml": "ebca6fefd29f612792b8957db940cc3237132140722d52b76999194823dbc5eb",
      "pseudocode/diffusion-transformer.yaml": "c30de43fb5cb70827e520b7f60c410d348de1c10d72646ab68e6b4a2d6064c65",
      "standard_blocks/adaln-zero-conditioning.yaml": "33cd9afbe3b6867c4ce328c25d41a33210a5e387a195a93b19bc8696ee9e0b32",
      "standard_blocks/sinusoidal-timestep-embedding.yaml": "8cb2d467fe967e9a83da657ef85940406be89836de502d24cb7f557152763039",
      "standard_blocks/per-item-adaln-conditioning.yaml": "544bca1c4d238825bfe6e389fe0409e64b27726b54f737e86021a0dc078987f9"
    }
  },
  "architecture": {
    "schemaVersion": "architecture-v0.4",
    "id": "diffusion_transformer",
    "name": "Diffusion Transformer (DiT)",
    "family": "transformer",
    "status": "draft",
    "taskModes": [
      "generation"
    ],
    "referenceConfiguration": {
      "model": "DiT-XL/2",
      "image_size": 256,
      "latent_size": 32,
      "patch_size": 2,
      "hidden_size": 1152,
      "depth": 28,
      "heads": 16,
      "learn_sigma": true,
      "evidence": {
        "status": "confirmed_from_paper",
        "refs": [
          {
            "source_ref": "dit_2022",
            "role": "supporting_evidence",
            "locator": "Table 1",
            "note": "DiT-XL/2 uses hidden size 1152, depth 28, and 16 attention heads with patch size 2."
          }
        ]
      }
    },
    "sourceYaml": "../../architectures/diffusion-transformer.yaml",
    "sources": [
      {
        "source_ref": "dit_2022",
        "role": "architecture_description"
      },
      {
        "source_ref": "dit_models_code",
        "role": "reference_implementation"
      },
      {
        "source_ref": "dit_sample_code",
        "role": "reference_implementation"
      },
      {
        "source_ref": "dit_gaussian_diffusion_code",
        "role": "reference_implementation"
      },
      {
        "source_ref": "dit_train_code",
        "role": "reference_implementation"
      }
    ],
    "decomposition": {
      "status": "complete",
      "evidence": {
        "status": "confirmed_from_code",
        "refs": [
          {
            "source_ref": "dit_sample_code",
            "role": "implementation_evidence",
            "locator": "main",
            "note": "Sampling, inverse latent scaling, and frozen VAE decoding form the complete generation path represented at the task boundary."
          }
        ]
      }
    },
    "coverage": {
      "method": "declared_decomposition_closure",
      "scopes": {
        "architecture": {
          "status": "complete",
          "depth": 0,
          "immediateModuleCount": 3,
          "immediateModuleRefs": [
            "modules.ddpm_sampler",
            "modules.inverse_latent_scaling",
            "modules.frozen_vae_decoder"
          ]
        },
        "modules.ddpm_sampler": {
          "status": "complete",
          "depth": 1,
          "immediateModuleCount": 2,
          "immediateModuleRefs": [
            "modules.dit_denoiser",
            "modules.reverse_diffusion_step"
          ]
        },
        "modules.dit_denoiser": {
          "status": "complete",
          "depth": 2,
          "immediateModuleCount": 7,
          "immediateModuleRefs": [
            "modules.patchify",
            "modules.timestep_embedder",
            "modules.label_embedder",
            "modules.cond_combiner",
            "modules.dit_blocks",
            "modules.final_layer",
            "modules.unpatchify"
          ]
        },
        "modules.reverse_diffusion_step": {
          "status": "leaf",
          "depth": 2,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.inverse_latent_scaling": {
          "status": "leaf",
          "depth": 1,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.frozen_vae_decoder": {
          "status": "opaque",
          "reason": "external_pretrained_component",
          "depth": 1,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.patchify": {
          "status": "leaf",
          "depth": 3,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.timestep_embedder": {
          "status": "complete",
          "depth": 3,
          "immediateModuleCount": 1,
          "immediateModuleRefs": [
            "modules.sinusoidal_embedding"
          ]
        },
        "modules.label_embedder": {
          "status": "leaf",
          "depth": 3,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.cond_combiner": {
          "status": "leaf",
          "depth": 3,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.dit_blocks": {
          "status": "complete",
          "depth": 3,
          "immediateModuleCount": 12,
          "immediateModuleRefs": [
            "modules.adaln_zero",
            "modules.adaln_mlp",
            "modules.norm1",
            "modules.adaln_mod",
            "modules.self_attention",
            "modules.gate1",
            "modules.add1",
            "modules.norm2",
            "modules.scale_shift2",
            "modules.mlp_branch",
            "modules.gate2",
            "modules.add2"
          ]
        },
        "modules.final_layer": {
          "status": "leaf",
          "depth": 3,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.unpatchify": {
          "status": "leaf",
          "depth": 3,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.sinusoidal_embedding": {
          "status": "leaf",
          "depth": 4,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.adaln_zero": {
          "status": "leaf",
          "depth": 4,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.adaln_mlp": {
          "status": "leaf",
          "depth": 4,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.norm1": {
          "status": "leaf",
          "depth": 4,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.adaln_mod": {
          "status": "leaf",
          "depth": 4,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.self_attention": {
          "status": "leaf",
          "depth": 4,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.gate1": {
          "status": "leaf",
          "depth": 4,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.add1": {
          "status": "leaf",
          "depth": 4,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.norm2": {
          "status": "leaf",
          "depth": 4,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.scale_shift2": {
          "status": "leaf",
          "depth": 4,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.mlp_branch": {
          "status": "leaf",
          "depth": 4,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.gate2": {
          "status": "leaf",
          "depth": 4,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.add2": {
          "status": "leaf",
          "depth": 4,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        }
      },
      "summary": {
        "scopeCount": 26,
        "expandedScopeCount": 5,
        "completeExpandedScopeCount": 5,
        "partialScopeCount": 0,
        "leafFrontierCount": 20,
        "opaqueFrontierCount": 1,
        "partialFrontierCount": 0,
        "maximumAuthoredDepth": 4
      },
      "opaqueFrontierRefs": [
        "modules.frozen_vae_decoder"
      ],
      "partialScopeRefs": [

      ]
    },
    "modules": [
      {
        "id": "ddpm_sampler",
        "parent_ref": "architecture",
        "decomposition": {
          "status": "complete"
        },
        "label": "DDPM Sampling Loop",
        "kind": "sampler",
        "mechanisms": [
          "reverse_diffusion",
          "ddpm"
        ],
        "role": "repeatedly call the classifier-free-guided DiT denoiser and apply stochastic reverse-diffusion updates",
        "scale": "spatial",
        "repeats": 250,
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_sample_code",
              "role": "implementation_evidence",
              "locator": "main",
              "note": "p_sample_loop starts from Gaussian latent noise and invokes forward_with_cfg over the reverse chain."
            },
            {
              "source_ref": "dit_gaussian_diffusion_code",
              "role": "implementation_evidence",
              "locator": "p_sample_loop_progressive",
              "note": "The reverse loop repeatedly samples x_(t-1) from the current state."
            }
          ]
        }
      },
      {
        "id": "dit_denoiser",
        "parent_ref": "modules.ddpm_sampler",
        "decomposition": {
          "status": "complete"
        },
        "label": "DiT Noise Predictor",
        "kind": "denoiser",
        "role": "evaluate the class- and timestep-conditioned Diffusion Transformer once to predict epsilon and learned-range variance parameters",
        "scale": "spatial",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiT.forward and DiT.forward_with_cfg",
              "note": "One denoiser call patchifies x_t, runs the conditioned block stack, and returns spatial model predictions."
            }
          ]
        }
      },
      {
        "id": "reverse_diffusion_step",
        "parent_ref": "modules.ddpm_sampler",
        "decomposition": {
          "status": "leaf"
        },
        "label": "DDPM Sampling Formula",
        "kind": "operator",
        "mechanisms": [
          "ddpm"
        ],
        "role": "use fixed diffusion-schedule math to combine x_t, timestep, predicted epsilon, learned-range variance parameters, and fresh noise into x_(t-1); this module has no learned weights",
        "scale": "spatial",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_gaussian_diffusion_code",
              "role": "implementation_evidence",
              "locator": "p_mean_variance and p_sample",
              "note": "The model output parameterizes the reverse mean and learned-range variance before fresh noise is added for nonzero timesteps."
            }
          ]
        }
      },
      {
        "id": "inverse_latent_scaling",
        "parent_ref": "architecture",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Undo Latent Scaling",
        "kind": "adapter",
        "mechanisms": [
          "latent_rescaling"
        ],
        "role": "divide the generated latent by 0.18215 to restore the frozen VAE decoder convention",
        "scale": "spatial",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_sample_code",
              "role": "implementation_evidence",
              "locator": "main",
              "note": "The final latent is divided by 0.18215 immediately before VAE decoding."
            }
          ]
        }
      },
      {
        "id": "frozen_vae_decoder",
        "parent_ref": "architecture",
        "decomposition": {
          "status": "opaque",
          "reason": "external_pretrained_component"
        },
        "label": "Frozen VAE Decoder",
        "kind": "decoder",
        "role": "decode the four-channel latent at one-eighth spatial resolution into RGB pixels",
        "scale": "output",
        "frozen": true,
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_sample_code",
              "role": "implementation_evidence",
              "locator": "main",
              "note": "A pretrained stabilityai/sd-vae-ft decoder maps the rescaled latent to the output image."
            }
          ]
        }
      },
      {
        "id": "patchify",
        "parent_ref": "modules.dit_denoiser",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Patchify",
        "kind": "adapter",
        "mechanisms": [
          "patchify"
        ],
        "role": "embed p x p latent patches into tokens and add fixed 2D sin-cos positional embeddings",
        "scale": "token",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "dit_2022",
              "role": "supporting_evidence",
              "locator": "Sec. 3.2 (Patchify)"
            },
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiT.__init__ (x_embedder, pos_embed)",
              "note": "PatchEmbed plus non-learned sin-cos positional table."
            }
          ]
        }
      },
      {
        "id": "timestep_embedder",
        "parent_ref": "modules.dit_denoiser",
        "decomposition": {
          "status": "complete"
        },
        "label": "Timestep Embedder",
        "kind": "adapter",
        "mechanisms": [
          "timestep_embedding"
        ],
        "role": "encode the scalar timestep with a 256-dim sinusoidal embedding followed by a two-layer SiLU MLP",
        "scale": "sample",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "TimestepEmbedder"
            }
          ]
        }
      },
      {
        "id": "label_embedder",
        "parent_ref": "modules.dit_denoiser",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Label Embedder",
        "kind": "adapter",
        "mechanisms": [
          "label_embedding"
        ],
        "role": "look up the class embedding; randomly drop labels to the null class during training for classifier-free guidance",
        "scale": "sample",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "LabelEmbedder"
            }
          ]
        }
      },
      {
        "id": "cond_combiner",
        "parent_ref": "modules.dit_denoiser",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Conditioning Combiner",
        "kind": "operator",
        "mechanisms": [
          "elementwise_sum"
        ],
        "role": "sum timestep and label embeddings into one per-sample conditioning vector",
        "scale": "sample",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiT.forward",
              "note": "c = t + y."
            }
          ]
        }
      },
      {
        "id": "dit_blocks",
        "parent_ref": "modules.dit_denoiser",
        "decomposition": {
          "status": "complete"
        },
        "label": "DiT-XL Block Stack",
        "kind": "refiner",
        "mechanisms": [
          "attention",
          "adaptive_normalization",
          "gated_residual"
        ],
        "role": "update patch tokens through 28 full-attention blocks with 16 heads, each using MLP and adaLN-Zero-gated residual branches",
        "scale": "token",
        "repeats": 28,
        "pseudocode_ref": "../../pseudocode/diffusion-transformer.yaml",
        "depth": {
          "blocks": 28,
          "heads": 16
        },
        "attention": {
          "pattern": "full",
          "query_scale": "token",
          "key_value_scale": "token",
          "heads": 16,
          "pair_bias": false,
          "pair_bias_source": "none",
          "positional_encoding": {
            "kind": "absolute_sincos_added_at_patchify"
          }
        },
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "dit_2022",
              "role": "supporting_evidence",
              "locator": "Sec. 3.2 (DiT block design), Table 1",
              "note": "Depth 28 / 16 heads is the DiT-XL configuration; other sizes exist."
            }
          ]
        }
      },
      {
        "id": "final_layer",
        "parent_ref": "modules.dit_denoiser",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Final Layer",
        "kind": "decoder",
        "role": "apply adaLN-modulated LayerNorm, then linearly decode each token to a p x p x C_out patch prediction",
        "scale": "token",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "FinalLayer"
            }
          ]
        }
      },
      {
        "id": "unpatchify",
        "parent_ref": "modules.dit_denoiser",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Unpatchify",
        "kind": "adapter",
        "mechanisms": [
          "unpatchify"
        ],
        "role": "rearrange per-token patch predictions back to the spatial latent layout",
        "scale": "spatial",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiT.unpatchify"
            }
          ]
        }
      },
      {
        "id": "sinusoidal_embedding",
        "parent_ref": "modules.timestep_embedder",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Sinusoidal Embedding + MLP",
        "kind": "adapter",
        "mechanisms": [
          "sinusoidal_embedding"
        ],
        "role": "reusable timestep embedding mechanism",
        "scale": "sample",
        "standard_block_ref": "../../standard_blocks/sinusoidal-timestep-embedding.yaml",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "TimestepEmbedder"
            }
          ]
        }
      },
      {
        "id": "adaln_zero",
        "parent_ref": "modules.dit_blocks",
        "decomposition": {
          "status": "leaf"
        },
        "label": "adaLN-Zero",
        "kind": "normalization",
        "mechanisms": [
          "adaptive_normalization",
          "gated_residual",
          "zero_initialization"
        ],
        "role": "reusable adaptive-normalization and gated-residual mechanism",
        "scale": "token",
        "standard_block_ref": "../../standard_blocks/adaln-zero-conditioning.yaml",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiTBlock"
            }
          ]
        }
      },
      {
        "id": "adaln_mlp",
        "parent_ref": "modules.dit_blocks",
        "decomposition": {
          "status": "leaf"
        },
        "label": "adaLN Modulation MLP",
        "kind": "adapter",
        "mechanisms": [
          "conditioning_projection"
        ],
        "role": "produce shift, scale, and gate parameters for the attention and MLP residual branches",
        "scale": "sample",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiTBlock",
              "note": "The modulation MLP output is chunked into six parameter vectors."
            }
          ]
        }
      },
      {
        "id": "norm1",
        "parent_ref": "modules.dit_blocks",
        "decomposition": {
          "status": "leaf"
        },
        "label": "LayerNorm 1",
        "kind": "normalization",
        "role": "normalize the token stream before attention modulation",
        "scale": "token",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiTBlock",
              "note": "The modulation MLP output is chunked into six parameter vectors."
            }
          ]
        }
      },
      {
        "id": "adaln_mod",
        "parent_ref": "modules.dit_blocks",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Attention Shift + Scale",
        "kind": "normalization",
        "mechanisms": [
          "adaptive_normalization"
        ],
        "role": "modulate normalized tokens with the attention branch shift and scale",
        "scale": "token",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiTBlock",
              "note": "The modulation MLP output is chunked into six parameter vectors."
            }
          ]
        }
      },
      {
        "id": "self_attention",
        "parent_ref": "modules.dit_blocks",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Multi-Head Self-Attention",
        "kind": "attention",
        "mechanisms": [
          "self_attention"
        ],
        "role": "apply full self-attention over latent patch tokens",
        "scale": "token",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiTBlock",
              "note": "The modulation MLP output is chunked into six parameter vectors."
            }
          ]
        }
      },
      {
        "id": "gate1",
        "parent_ref": "modules.dit_blocks",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Attention Gate",
        "kind": "residual_update",
        "mechanisms": [
          "gated_residual"
        ],
        "role": "multiply the attention update by its zero-initialized conditioning gate",
        "scale": "token",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiTBlock",
              "note": "The modulation MLP output is chunked into six parameter vectors."
            }
          ]
        }
      },
      {
        "id": "add1",
        "parent_ref": "modules.dit_blocks",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Attention Residual Add",
        "kind": "residual_update",
        "mechanisms": [
          "residual_add"
        ],
        "role": "add the gated attention branch to the incoming token state",
        "scale": "token",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiTBlock",
              "note": "The modulation MLP output is chunked into six parameter vectors."
            }
          ]
        }
      },
      {
        "id": "norm2",
        "parent_ref": "modules.dit_blocks",
        "decomposition": {
          "status": "leaf"
        },
        "label": "LayerNorm 2",
        "kind": "normalization",
        "role": "normalize the post-attention token state before MLP modulation",
        "scale": "token",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiTBlock",
              "note": "The modulation MLP output is chunked into six parameter vectors."
            }
          ]
        }
      },
      {
        "id": "scale_shift2",
        "parent_ref": "modules.dit_blocks",
        "decomposition": {
          "status": "leaf"
        },
        "label": "MLP Shift + Scale",
        "kind": "normalization",
        "mechanisms": [
          "adaptive_normalization"
        ],
        "role": "modulate normalized tokens with the MLP branch shift and scale",
        "scale": "token",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiTBlock",
              "note": "The modulation MLP output is chunked into six parameter vectors."
            }
          ]
        }
      },
      {
        "id": "mlp_branch",
        "parent_ref": "modules.dit_blocks",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Feed-Forward MLP",
        "kind": "feed_forward",
        "role": "apply the token-wise MLP residual branch",
        "scale": "token",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiTBlock",
              "note": "The modulation MLP output is chunked into six parameter vectors."
            }
          ]
        }
      },
      {
        "id": "gate2",
        "parent_ref": "modules.dit_blocks",
        "decomposition": {
          "status": "leaf"
        },
        "label": "MLP Gate",
        "kind": "residual_update",
        "mechanisms": [
          "gated_residual"
        ],
        "role": "multiply the MLP update by its zero-initialized conditioning gate",
        "scale": "token",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiTBlock",
              "note": "The modulation MLP output is chunked into six parameter vectors."
            }
          ]
        }
      },
      {
        "id": "add2",
        "parent_ref": "modules.dit_blocks",
        "decomposition": {
          "status": "leaf"
        },
        "label": "MLP Residual Add",
        "kind": "residual_update",
        "mechanisms": [
          "residual_add"
        ],
        "role": "add the gated MLP branch to the post-attention token state",
        "scale": "token",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiTBlock",
              "note": "The modulation MLP output is chunked into six parameter vectors."
            }
          ]
        }
      }
    ],
    "blockInstances": [

    ],
    "representations": [
      {
        "id": "initial_noise",
        "scale": "spatial",
        "semantic_role": "standard-normal latent that initializes reverse diffusion",
        "shape": "B x 4 x I x I (I = image_size / 8)",
        "carries": [
          "initial Gaussian sampling state x_T"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_sample_code",
              "role": "implementation_evidence",
              "locator": "main",
              "note": "Sampling starts with torch.randn at four latent channels and one-eighth image resolution."
            }
          ]
        }
      },
      {
        "id": "step_noise",
        "scale": "spatial",
        "semantic_role": "fresh Gaussian noise used by one stochastic reverse-diffusion update",
        "shape": "B x 4 x I x I",
        "carries": [
          "reverse-step stochasticity for t greater than zero"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_gaussian_diffusion_code",
              "role": "implementation_evidence",
              "locator": "p_sample",
              "note": "A fresh randn_like tensor contributes when t is nonzero."
            }
          ]
        }
      },
      {
        "id": "input_latent",
        "scale": "spatial",
        "semantic_role": "noised VAE latent at the current denoising step",
        "shape": "B x 4 x I x I (I = 32 for 256^2 images)",
        "carries": [
          "noised image content"
        ],
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "dit_2022",
              "role": "supporting_evidence",
              "locator": "Sec. 3 (Latent diffusion), Sec. 3.2"
            }
          ]
        }
      },
      {
        "id": "timestep",
        "scale": "sample",
        "semantic_role": "diffusion timestep index for the current step",
        "shape": "B",
        "carries": [
          "noise level"
        ],
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "dit_2022",
              "role": "supporting_evidence",
              "locator": "Sec. 3.2"
            }
          ]
        }
      },
      {
        "id": "class_label",
        "scale": "sample",
        "semantic_role": "class conditioning input (with a null class for classifier-free guidance)",
        "shape": "B",
        "carries": [
          "class identity"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "LabelEmbedder",
              "note": "Dropped labels are mapped to an extra embedding index num_classes."
            }
          ]
        }
      },
      {
        "id": "t_embedding",
        "scale": "sample",
        "semantic_role": "embedded timestep",
        "shape": "B x d",
        "carries": [
          "noise-level embedding"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "TimestepEmbedder"
            }
          ]
        }
      },
      {
        "id": "y_embedding",
        "scale": "sample",
        "semantic_role": "embedded class label",
        "shape": "B x d",
        "carries": [
          "class embedding"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "LabelEmbedder"
            }
          ]
        }
      },
      {
        "id": "cond_vector",
        "scale": "sample",
        "semantic_role": "combined conditioning vector shared by all tokens of a sample",
        "shape": "B x d",
        "carries": [
          "timestep and class conditioning"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiT.forward",
              "note": "c = t + y before the block stack."
            }
          ]
        }
      },
      {
        "id": "token_state",
        "scale": "token",
        "semantic_role": "mutable patch-token stream",
        "shape": "B x T x d, T = (I/p)^2",
        "carries": [
          "patch content",
          "fixed 2D sin-cos positional embedding"
        ],
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "dit_2022",
              "role": "supporting_evidence",
              "locator": "Sec. 3.2 (Patchify)"
            }
          ]
        }
      },
      {
        "id": "output_tokens",
        "scale": "token",
        "semantic_role": "decoded per-token patch predictions",
        "shape": "B x T x (p * p * C_out), C_out = 2C if learn_sigma else C",
        "carries": [
          "predicted noise patch",
          "learned-range variance-parameter patch when enabled"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "FinalLayer",
              "note": "Linear(hidden_size, patch_size * patch_size * out_channels)."
            }
          ]
        }
      },
      {
        "id": "noise_prediction",
        "scale": "spatial",
        "semantic_role": "DiT output containing epsilon and optional learned-range variance parameters at latent resolution",
        "shape": "B x C_out x I x I, C_out = 2C if learn_sigma else C",
        "carries": [
          "epsilon prediction in the first C channels",
          "model_var_values in the second C channels when learn_sigma is enabled"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiT.__init__",
              "note": "out_channels is 2C only when learn_sigma is enabled."
            },
            {
              "source_ref": "dit_gaussian_diffusion_code",
              "role": "implementation_evidence",
              "locator": "p_mean_variance",
              "note": "The second C channels interpolate between minimum and maximum log variance."
            }
          ]
        }
      },
      {
        "id": "final_latent",
        "scale": "spatial",
        "semantic_role": "final latent x_0 returned by the reverse-diffusion sampler",
        "shape": "B x 4 x I x I",
        "carries": [
          "generated latent before VAE decode scaling"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_sample_code",
              "role": "implementation_evidence",
              "locator": "main",
              "note": "p_sample_loop returns the generated latent before VAE decoding."
            }
          ]
        }
      },
      {
        "id": "vae_decode_latent",
        "scale": "spatial",
        "semantic_role": "final latent divided by 0.18215 for the frozen VAE decoder",
        "shape": "B x 4 x I x I",
        "carries": [
          "latent in the VAE decoder convention"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_sample_code",
              "role": "implementation_evidence",
              "locator": "main",
              "note": "The sampler output is divided by 0.18215 immediately before vae.decode."
            }
          ]
        }
      },
      {
        "id": "generated_image",
        "scale": "output",
        "semantic_role": "RGB image decoded from the generated latent",
        "shape": "B x 3 x H x W, H = W = 8I",
        "carries": [
          "generated RGB pixels"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_sample_code",
              "role": "implementation_evidence",
              "locator": "main",
              "note": "The frozen Stable Diffusion VAE decodes the final latent to an image tensor."
            }
          ]
        }
      },
      {
        "id": "adaln_parameter_triplet",
        "scale": "sample",
        "semantic_role": "shift, scale, and residual-gate parameters for one DiT branch",
        "shape": "B x 3 x d",
        "carries": [
          "adaptive normalization shift and scale",
          "zero-initialized residual gate"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiTBlock",
              "note": "The six-way modulation output is split into shift, scale, and gate triplets for attention and MLP branches."
            }
          ]
        }
      }
    ],
    "valueSites": [
      {
        "id": "initial_noise",
        "representation_ref": "representations.initial_noise",
        "scope_ref": "architecture",
        "boundary": "input",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_sample_code",
              "role": "implementation_evidence",
              "locator": "main",
              "note": "The sampling entry point constructs the initial latent, labels, terminal latent, VAE decode input, and generated image occurrences."
            }
          ]
        }
      },
      {
        "id": "class_label",
        "representation_ref": "representations.class_label",
        "scope_ref": "architecture",
        "boundary": "input",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_sample_code",
              "role": "implementation_evidence",
              "locator": "main",
              "note": "The sampling entry point constructs the initial latent, labels, terminal latent, VAE decode input, and generated image occurrences."
            }
          ]
        }
      },
      {
        "id": "latent_before_step",
        "representation_ref": "representations.input_latent",
        "scope_ref": "modules.ddpm_sampler",
        "role": "state_read",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_gaussian_diffusion_code",
              "role": "implementation_evidence",
              "locator": "p_sample_loop_progressive and p_sample",
              "note": "The reverse loop distinguishes its current latent, updated latent, timestep, and fresh per-step noise occurrences."
            }
          ]
        }
      },
      {
        "id": "latent_after_step",
        "representation_ref": "representations.input_latent",
        "scope_ref": "modules.ddpm_sampler",
        "role": "state_write",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_gaussian_diffusion_code",
              "role": "implementation_evidence",
              "locator": "p_sample_loop_progressive and p_sample",
              "note": "The reverse loop distinguishes its current latent, updated latent, timestep, and fresh per-step noise occurrences."
            }
          ]
        }
      },
      {
        "id": "timestep",
        "representation_ref": "representations.timestep",
        "scope_ref": "modules.ddpm_sampler",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_gaussian_diffusion_code",
              "role": "implementation_evidence",
              "locator": "p_sample_loop_progressive and p_sample",
              "note": "The reverse loop distinguishes its current latent, updated latent, timestep, and fresh per-step noise occurrences."
            }
          ]
        }
      },
      {
        "id": "step_noise",
        "representation_ref": "representations.step_noise",
        "scope_ref": "modules.ddpm_sampler",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_gaussian_diffusion_code",
              "role": "implementation_evidence",
              "locator": "p_sample_loop_progressive and p_sample",
              "note": "The reverse loop distinguishes its current latent, updated latent, timestep, and fresh per-step noise occurrences."
            }
          ]
        }
      },
      {
        "id": "t_embedding",
        "representation_ref": "representations.t_embedding",
        "scope_ref": "modules.timestep_embedder",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiT.forward, TimestepEmbedder, LabelEmbedder, and DiTBlock",
              "note": "The forward pass creates timestep, label, combined-conditioning, patch-token, block-token, and denoiser-output occurrences."
            }
          ]
        }
      },
      {
        "id": "y_embedding",
        "representation_ref": "representations.y_embedding",
        "scope_ref": "modules.label_embedder",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiT.forward, TimestepEmbedder, LabelEmbedder, and DiTBlock",
              "note": "The forward pass creates timestep, label, combined-conditioning, patch-token, block-token, and denoiser-output occurrences."
            }
          ]
        }
      },
      {
        "id": "cond_vector",
        "representation_ref": "representations.cond_vector",
        "scope_ref": "modules.cond_combiner",
        "role": "read_only_conditioning",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiT.forward, TimestepEmbedder, LabelEmbedder, and DiTBlock",
              "note": "The forward pass creates timestep, label, combined-conditioning, patch-token, block-token, and denoiser-output occurrences."
            }
          ]
        }
      },
      {
        "id": "tokens_after_patchify",
        "representation_ref": "representations.token_state",
        "scope_ref": "modules.patchify",
        "role": "state_read",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiT.forward, TimestepEmbedder, LabelEmbedder, and DiTBlock",
              "note": "The forward pass creates timestep, label, combined-conditioning, patch-token, block-token, and denoiser-output occurrences."
            }
          ]
        }
      },
      {
        "id": "block_input_tokens",
        "representation_ref": "representations.token_state",
        "scope_ref": "modules.dit_blocks",
        "role": "interface_read",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiT.forward, TimestepEmbedder, LabelEmbedder, and DiTBlock",
              "note": "The forward pass creates timestep, label, combined-conditioning, patch-token, block-token, and denoiser-output occurrences."
            }
          ]
        }
      },
      {
        "id": "attn_params",
        "representation_ref": "representations.adaln_parameter_triplet",
        "scope_ref": "modules.adaln_mlp",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiT.forward, TimestepEmbedder, LabelEmbedder, and DiTBlock",
              "note": "The forward pass creates timestep, label, combined-conditioning, patch-token, block-token, and denoiser-output occurrences."
            }
          ]
        }
      },
      {
        "id": "mlp_params",
        "representation_ref": "representations.adaln_parameter_triplet",
        "scope_ref": "modules.adaln_mlp",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiT.forward, TimestepEmbedder, LabelEmbedder, and DiTBlock",
              "note": "The forward pass creates timestep, label, combined-conditioning, patch-token, block-token, and denoiser-output occurrences."
            }
          ]
        }
      },
      {
        "id": "tokens_after_blocks",
        "representation_ref": "representations.token_state",
        "scope_ref": "modules.add2",
        "role": "state_write",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiT.forward, TimestepEmbedder, LabelEmbedder, and DiTBlock",
              "note": "The forward pass creates timestep, label, combined-conditioning, patch-token, block-token, and denoiser-output occurrences."
            }
          ]
        }
      },
      {
        "id": "output_tokens",
        "representation_ref": "representations.output_tokens",
        "scope_ref": "modules.final_layer",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiT.forward, TimestepEmbedder, LabelEmbedder, and DiTBlock",
              "note": "The forward pass creates timestep, label, combined-conditioning, patch-token, block-token, and denoiser-output occurrences."
            }
          ]
        }
      },
      {
        "id": "noise_prediction",
        "representation_ref": "representations.noise_prediction",
        "scope_ref": "modules.dit_denoiser",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiT.forward, TimestepEmbedder, LabelEmbedder, and DiTBlock",
              "note": "The forward pass creates timestep, label, combined-conditioning, patch-token, block-token, and denoiser-output occurrences."
            }
          ]
        }
      },
      {
        "id": "final_latent",
        "representation_ref": "representations.final_latent",
        "scope_ref": "modules.ddpm_sampler",
        "role": "output_state",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_sample_code",
              "role": "implementation_evidence",
              "locator": "main",
              "note": "The sampling entry point constructs the initial latent, labels, terminal latent, VAE decode input, and generated image occurrences."
            }
          ]
        }
      },
      {
        "id": "vae_decode_latent",
        "representation_ref": "representations.vae_decode_latent",
        "scope_ref": "modules.inverse_latent_scaling",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_sample_code",
              "role": "implementation_evidence",
              "locator": "main",
              "note": "The sampling entry point constructs the initial latent, labels, terminal latent, VAE decode input, and generated image occurrences."
            }
          ]
        }
      },
      {
        "id": "generated_image",
        "representation_ref": "representations.generated_image",
        "scope_ref": "architecture",
        "boundary": "output",
        "role": "task_output",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_sample_code",
              "role": "implementation_evidence",
              "locator": "main",
              "note": "The sampling entry point constructs the initial latent, labels, terminal latent, VAE decode input, and generated image occurrences."
            }
          ]
        }
      }
    ],
    "valueSiteInterfaces": {
      "initial_noise": {
        "incomingRelationRefs": [

        ],
        "outgoingRelationRefs": [
          "relations.initial_noise_initializes_current_latent"
        ],
        "producerRefs": [

        ],
        "consumerRefs": [
          "value_sites.latent_before_step"
        ]
      },
      "class_label": {
        "incomingRelationRefs": [

        ],
        "outgoingRelationRefs": [
          "relations.class_label_featurization"
        ],
        "producerRefs": [

        ],
        "consumerRefs": [
          "modules.label_embedder"
        ]
      },
      "latent_before_step": {
        "incomingRelationRefs": [
          "relations.initial_noise_initializes_current_latent",
          "relations.updated_latent_reenters_sampling_iteration"
        ],
        "outgoingRelationRefs": [
          "relations.current_latent_enters_reverse_diffusion_step",
          "relations.input_latent_patch_embedding"
        ],
        "producerRefs": [
          "value_sites.initial_noise",
          "value_sites.latent_after_step"
        ],
        "consumerRefs": [
          "modules.reverse_diffusion_step",
          "modules.patchify"
        ]
      },
      "latent_after_step": {
        "incomingRelationRefs": [
          "relations.reverse_diffusion_step_updates_current_latent"
        ],
        "outgoingRelationRefs": [
          "relations.updated_latent_reenters_sampling_iteration",
          "relations.current_latent_becomes_final_latent"
        ],
        "producerRefs": [
          "modules.reverse_diffusion_step"
        ],
        "consumerRefs": [
          "value_sites.latent_before_step",
          "value_sites.final_latent"
        ]
      },
      "timestep": {
        "incomingRelationRefs": [

        ],
        "outgoingRelationRefs": [
          "relations.timestep_enters_reverse_diffusion_step",
          "relations.timestep_featurization"
        ],
        "producerRefs": [

        ],
        "consumerRefs": [
          "modules.reverse_diffusion_step",
          "modules.timestep_embedder"
        ]
      },
      "step_noise": {
        "incomingRelationRefs": [

        ],
        "outgoingRelationRefs": [
          "relations.step_noise_enters_reverse_diffusion_step"
        ],
        "producerRefs": [

        ],
        "consumerRefs": [
          "modules.reverse_diffusion_step"
        ]
      },
      "t_embedding": {
        "incomingRelationRefs": [
          "relations.timestep_embedding_projection"
        ],
        "outgoingRelationRefs": [
          "relations.timestep_conditioning_sum"
        ],
        "producerRefs": [
          "modules.timestep_embedder"
        ],
        "consumerRefs": [
          "modules.cond_combiner"
        ]
      },
      "y_embedding": {
        "incomingRelationRefs": [
          "relations.class_embedding_lookup"
        ],
        "outgoingRelationRefs": [
          "relations.class_conditioning_sum"
        ],
        "producerRefs": [
          "modules.label_embedder"
        ],
        "consumerRefs": [
          "modules.cond_combiner"
        ]
      },
      "cond_vector": {
        "incomingRelationRefs": [
          "relations.conditioning_vector_initialization"
        ],
        "outgoingRelationRefs": [
          "relations.cond_vector_enters_adaln_mlp",
          "relations.final_layer_adaln_conditioning"
        ],
        "producerRefs": [
          "modules.cond_combiner"
        ],
        "consumerRefs": [
          "modules.adaln_mlp",
          "modules.final_layer"
        ]
      },
      "tokens_after_patchify": {
        "incomingRelationRefs": [
          "relations.token_state_initialization"
        ],
        "outgoingRelationRefs": [
          "relations.tokens_enter_block_stack"
        ],
        "producerRefs": [
          "modules.patchify"
        ],
        "consumerRefs": [
          "value_sites.block_input_tokens"
        ]
      },
      "block_input_tokens": {
        "incomingRelationRefs": [
          "relations.tokens_enter_block_stack"
        ],
        "outgoingRelationRefs": [
          "relations.tokens_enter_block_norm1",
          "relations.tokens_skip_to_add1"
        ],
        "producerRefs": [
          "value_sites.tokens_after_patchify"
        ],
        "consumerRefs": [
          "modules.norm1",
          "modules.add1"
        ]
      },
      "attn_params": {
        "incomingRelationRefs": [
          "relations.adaln_mlp_produces_attn_params"
        ],
        "outgoingRelationRefs": [
          "relations.attn_params_enter_adaln_mod",
          "relations.attn_params_enter_gate1"
        ],
        "producerRefs": [
          "modules.adaln_mlp"
        ],
        "consumerRefs": [
          "modules.adaln_mod",
          "modules.gate1"
        ]
      },
      "mlp_params": {
        "incomingRelationRefs": [
          "relations.adaln_mlp_produces_mlp_params"
        ],
        "outgoingRelationRefs": [
          "relations.mlp_params_enter_scale_shift2",
          "relations.mlp_params_enter_gate2"
        ],
        "producerRefs": [
          "modules.adaln_mlp"
        ],
        "consumerRefs": [
          "modules.scale_shift2",
          "modules.gate2"
        ]
      },
      "tokens_after_blocks": {
        "incomingRelationRefs": [
          "relations.add2_produces_tokens_after_blocks"
        ],
        "outgoingRelationRefs": [
          "relations.refined_tokens_to_final_layer"
        ],
        "producerRefs": [
          "modules.add2"
        ],
        "consumerRefs": [
          "modules.final_layer"
        ]
      },
      "output_tokens": {
        "incomingRelationRefs": [
          "relations.output_token_linear_decode"
        ],
        "outgoingRelationRefs": [
          "relations.output_token_layout_restoration"
        ],
        "producerRefs": [
          "modules.final_layer"
        ],
        "consumerRefs": [
          "modules.unpatchify"
        ]
      },
      "noise_prediction": {
        "incomingRelationRefs": [
          "relations.spatial_noise_prediction"
        ],
        "outgoingRelationRefs": [
          "relations.noise_prediction_enters_reverse_diffusion_step"
        ],
        "producerRefs": [
          "modules.unpatchify"
        ],
        "consumerRefs": [
          "modules.reverse_diffusion_step"
        ]
      },
      "final_latent": {
        "incomingRelationRefs": [
          "relations.current_latent_becomes_final_latent"
        ],
        "outgoingRelationRefs": [
          "relations.final_latent_enters_inverse_scaling"
        ],
        "producerRefs": [
          "value_sites.latent_after_step"
        ],
        "consumerRefs": [
          "modules.inverse_latent_scaling"
        ]
      },
      "vae_decode_latent": {
        "incomingRelationRefs": [
          "relations.inverse_scaling_produces_vae_decode_latent"
        ],
        "outgoingRelationRefs": [
          "relations.vae_decode_latent_enters_frozen_decoder"
        ],
        "producerRefs": [
          "modules.inverse_latent_scaling"
        ],
        "consumerRefs": [
          "modules.frozen_vae_decoder"
        ]
      },
      "generated_image": {
        "incomingRelationRefs": [
          "relations.frozen_decoder_produces_generated_image"
        ],
        "outgoingRelationRefs": [

        ],
        "producerRefs": [
          "modules.frozen_vae_decoder"
        ],
        "consumerRefs": [

        ]
      }
    },
    "execution": {
      "loops": [
        {
          "id": "denoising_loop",
          "repeats": "num_sampling_steps",
          "reruns": [
            "modules.patchify",
            "modules.timestep_embedder",
            "modules.label_embedder",
            "modules.cond_combiner",
            "modules.dit_blocks",
            "modules.final_layer",
            "modules.unpatchify",
            "modules.reverse_diffusion_step"
          ],
          "cached": [

          ],
          "notes": [
            "The full backbone reruns at every denoising step; both the sampled latent x_t and timestep t change, while the class label remains fixed for a sample.",
            "A fresh Gaussian step-noise tensor enters each reverse update for t greater than zero; the final t=0 update is deterministic.",
            "Classifier-free guidance runs a conditional and an unconditional pass per step, batched together in the reference sampler.",
            "For exact reproducibility, the official forward_with_cfg path guides only the first three epsilon channels; the standard alternative guides all C epsilon channels."
          ],
          "evidence": {
            "status": "confirmed_from_code",
            "refs": [
              {
                "source_ref": "dit_gaussian_diffusion_code",
                "role": "implementation_evidence",
                "locator": "p_sample_loop_progressive",
                "note": "Each reverse step replaces x_t with a newly sampled x_(t-1); nonzero timesteps add fresh Gaussian noise."
              },
              {
                "source_ref": "dit_models_code",
                "role": "implementation_evidence",
                "locator": "DiT.forward_with_cfg",
                "note": "Conditional and null-label branches are batched; the reproducibility path guides the first three channels."
              },
              {
                "source_ref": "dit_2022",
                "role": "supporting_evidence",
                "locator": "Sec. 3.1, Sec. 4",
                "note": "DDPM sampling with classifier-free guidance; 250 sampling steps for reported results."
              }
            ]
          }
        }
      ]
    },
    "stateSemantics": {
      "sampling_latent": {
        "representation_ref": "representations.input_latent",
        "value_site_refs": [
          "value_sites.latent_before_step",
          "value_sites.latent_after_step"
        ],
        "lifecycle": "iterative_loop_state",
        "notes": [
          "The before and after sites distinguish x_t from x_(t-1), avoiding an ambiguous self-edge for mutable loop state."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_gaussian_diffusion_code",
              "role": "implementation_evidence",
              "locator": "p_sample_loop_progressive and p_sample"
            }
          ]
        }
      },
      "final_latent": {
        "representation_ref": "representations.final_latent",
        "value_site_refs": [
          "value_sites.final_latent"
        ],
        "lifecycle": "terminal_sampler_output",
        "notes": [
          "This is x_0 after the last reverse-diffusion update, before undoing the VAE latent scale."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_sample_code",
              "role": "implementation_evidence",
              "locator": "main"
            }
          ]
        }
      },
      "generated_image": {
        "representation_ref": "representations.generated_image",
        "value_site_refs": [
          "value_sites.generated_image"
        ],
        "lifecycle": "task_output",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_sample_code",
              "role": "implementation_evidence",
              "locator": "main"
            }
          ]
        }
      },
      "denoiser_token_state": {
        "representation_ref": "representations.token_state",
        "value_site_refs": [
          "value_sites.tokens_after_patchify",
          "value_sites.block_input_tokens",
          "value_sites.tokens_after_blocks"
        ],
        "lifecycle": "transformed_within_forward_pass",
        "notes": [
          "The token stream is the only mutable state inside one forward pass."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiT.forward and DiTBlock"
            }
          ]
        }
      },
      "conditioning_vector": {
        "representation_ref": "representations.cond_vector",
        "value_site_refs": [
          "value_sites.cond_vector"
        ],
        "lifecycle": "read_only_within_forward_pass",
        "notes": [
          "Per-sample vector; every token in a sample shares the same modulation parameters."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiT.forward and DiTBlock"
            }
          ]
        }
      }
    },
    "stateSemanticsBySite": {
      "latent_before_step": {
        "representation_ref": "representations.input_latent",
        "value_site_refs": [
          "value_sites.latent_before_step",
          "value_sites.latent_after_step"
        ],
        "lifecycle": "iterative_loop_state",
        "notes": [
          "The before and after sites distinguish x_t from x_(t-1), avoiding an ambiguous self-edge for mutable loop state."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_gaussian_diffusion_code",
              "role": "implementation_evidence",
              "locator": "p_sample_loop_progressive and p_sample"
            }
          ]
        },
        "groupId": "sampling_latent"
      },
      "latent_after_step": {
        "representation_ref": "representations.input_latent",
        "value_site_refs": [
          "value_sites.latent_before_step",
          "value_sites.latent_after_step"
        ],
        "lifecycle": "iterative_loop_state",
        "notes": [
          "The before and after sites distinguish x_t from x_(t-1), avoiding an ambiguous self-edge for mutable loop state."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_gaussian_diffusion_code",
              "role": "implementation_evidence",
              "locator": "p_sample_loop_progressive and p_sample"
            }
          ]
        },
        "groupId": "sampling_latent"
      },
      "final_latent": {
        "representation_ref": "representations.final_latent",
        "value_site_refs": [
          "value_sites.final_latent"
        ],
        "lifecycle": "terminal_sampler_output",
        "notes": [
          "This is x_0 after the last reverse-diffusion update, before undoing the VAE latent scale."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_sample_code",
              "role": "implementation_evidence",
              "locator": "main"
            }
          ]
        },
        "groupId": "final_latent"
      },
      "generated_image": {
        "representation_ref": "representations.generated_image",
        "value_site_refs": [
          "value_sites.generated_image"
        ],
        "lifecycle": "task_output",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_sample_code",
              "role": "implementation_evidence",
              "locator": "main"
            }
          ]
        },
        "groupId": "generated_image"
      },
      "tokens_after_patchify": {
        "representation_ref": "representations.token_state",
        "value_site_refs": [
          "value_sites.tokens_after_patchify",
          "value_sites.block_input_tokens",
          "value_sites.tokens_after_blocks"
        ],
        "lifecycle": "transformed_within_forward_pass",
        "notes": [
          "The token stream is the only mutable state inside one forward pass."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiT.forward and DiTBlock"
            }
          ]
        },
        "groupId": "denoiser_token_state"
      },
      "block_input_tokens": {
        "representation_ref": "representations.token_state",
        "value_site_refs": [
          "value_sites.tokens_after_patchify",
          "value_sites.block_input_tokens",
          "value_sites.tokens_after_blocks"
        ],
        "lifecycle": "transformed_within_forward_pass",
        "notes": [
          "The token stream is the only mutable state inside one forward pass."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiT.forward and DiTBlock"
            }
          ]
        },
        "groupId": "denoiser_token_state"
      },
      "tokens_after_blocks": {
        "representation_ref": "representations.token_state",
        "value_site_refs": [
          "value_sites.tokens_after_patchify",
          "value_sites.block_input_tokens",
          "value_sites.tokens_after_blocks"
        ],
        "lifecycle": "transformed_within_forward_pass",
        "notes": [
          "The token stream is the only mutable state inside one forward pass."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiT.forward and DiTBlock"
            }
          ]
        },
        "groupId": "denoiser_token_state"
      },
      "cond_vector": {
        "representation_ref": "representations.cond_vector",
        "value_site_refs": [
          "value_sites.cond_vector"
        ],
        "lifecycle": "read_only_within_forward_pass",
        "notes": [
          "Per-sample vector; every token in a sample shares the same modulation parameters."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiT.forward and DiTBlock"
            }
          ]
        },
        "groupId": "conditioning_vector"
      }
    },
    "conditioning": [
      {
        "id": "sampling_class_guidance",
        "relation_ref": "relations.class_label_featurization",
        "mode": "classifier_free_guidance",
        "updates_source": false,
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_sample_code",
              "role": "implementation_evidence",
              "locator": "main",
              "note": "Conditional labels are paired with null labels and passed through forward_with_cfg."
            }
          ]
        },
        "source": "value_sites.class_label",
        "target": "modules.label_embedder"
      },
      {
        "id": "block_adaln_zero",
        "relation_ref": "relations.cond_vector_enters_adaln_mlp",
        "mode": "adaln_zero",
        "standard_block_ref": "standard_blocks/adaln-zero-conditioning.yaml",
        "updates_source": false,
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiTBlock",
              "note": "adaLN_modulation(c).chunk(6) yields shift/scale/gate for both branches; the weights and bias of the entire six-output modulation linear are zero-initialized."
            }
          ]
        },
        "source": "value_sites.cond_vector",
        "target": "modules.adaln_mlp"
      },
      {
        "id": "final_layer_adaln",
        "relation_ref": "relations.final_layer_adaln_conditioning",
        "mode": "adaln",
        "updates_source": false,
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "FinalLayer",
              "note": "adaLN_modulation(c).chunk(2) yields shift/scale before the linear decode; no gate in the final layer."
            }
          ]
        },
        "source": "value_sites.cond_vector",
        "target": "modules.final_layer"
      }
    ],
    "scaleTransitions": [
      {
        "id": "patchify_tokens",
        "relation_path": [
          "relations.input_latent_patch_embedding",
          "relations.token_state_initialization"
        ],
        "aggregation": "flatten_patches",
        "copy_vs_pool": "pool",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "dit_2022",
              "role": "supporting_evidence",
              "locator": "Sec. 3.2 (Patchify)",
              "note": "p x p patches are linearly embedded into T = (I/p)^2 tokens."
            }
          ]
        },
        "source": "value_sites.latent_before_step",
        "target": "value_sites.tokens_after_patchify",
        "from_scale": "spatial",
        "to_scale": "token",
        "projection_refs": [
          "modules.patchify"
        ]
      },
      {
        "id": "unpatchify_output",
        "relation_path": [
          "relations.output_token_layout_restoration",
          "relations.spatial_noise_prediction"
        ],
        "aggregation": "reshape",
        "copy_vs_pool": "copy",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "dit_2022",
              "role": "supporting_evidence",
              "locator": "Sec. 3.2 (Transformer decoder)",
              "note": "Decoded tokens are rearranged back to the spatial latent layout; lossless reshape."
            }
          ]
        },
        "source": "value_sites.output_tokens",
        "target": "value_sites.noise_prediction",
        "from_scale": "token",
        "to_scale": "spatial",
        "projection_refs": [
          "modules.unpatchify"
        ]
      },
      {
        "id": "vae_decode_pixels",
        "relation_path": [
          "relations.vae_decode_latent_enters_frozen_decoder",
          "relations.frozen_decoder_produces_generated_image"
        ],
        "aggregation": "learned_upsampling",
        "copy_vs_pool": "expand",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_sample_code",
              "role": "implementation_evidence",
              "locator": "main",
              "note": "The pretrained VAE decoder maps the four-channel latent at one-eighth resolution to RGB pixels."
            }
          ]
        },
        "source": "value_sites.vae_decode_latent",
        "target": "value_sites.generated_image",
        "from_scale": "spatial",
        "to_scale": "output",
        "projection_refs": [
          "modules.frozen_vae_decoder"
        ]
      }
    ],
    "trainingInference": {
      "objective": {
        "kind": "diffusion_noise_prediction",
        "notes": [
          "With learn_sigma=true, the model emits C epsilon channels plus C learned-range variance parameters; epsilon uses MSE and the variance parameters use a variational-bound term following ADM.",
          "With learn_sigma=false, the model emits only C epsilon channels."
        ]
      },
      "schedule": {
        "kind": "linear_variance",
        "steps": 1000
      },
      "sampler": {
        "kind": "ddpm",
        "steps": 250,
        "configurable": true,
        "base_schedule_steps": 1000,
        "timestep_selection": "respaced",
        "initial_state": "standard_normal_latent",
        "guidance": "classifier_free",
        "update": "learned_range_variance",
        "clip_denoised": false
      },
      "latent_codec": {
        "kind": "frozen_stable_diffusion_vae",
        "latent_channels": 4,
        "spatial_downsampling": 8,
        "decode_scale_divisor": 0.18215
      },
      "teacher_forcing": "not_applicable",
      "self_conditioning": "none",
      "checkpoint_notes": [
        "The generation system uses the frozen stabilityai/sd-vae-ft-{ema|mse} decoder after sampling; the DiT denoiser itself operates only in latent space.",
        "The visible 28-block, 16-head backbone is the DiT-XL/2 reference configuration; smaller official variants use different depths and head counts."
      ],
      "evidence": {
        "status": "confirmed_from_code",
        "refs": [
          {
            "source_ref": "dit_train_code",
            "role": "implementation_evidence",
            "locator": "main",
            "note": "The training entry point defines the diffusion objective and frozen VAE encoding path."
          },
          {
            "source_ref": "dit_sample_code",
            "role": "implementation_evidence",
            "locator": "main",
            "note": "The sampling entry point defines classifier-free guidance, schedule respacing, latent scaling, and frozen VAE decoding."
          }
        ]
      }
    },
    "relations": [
      {
        "id": "adaln_mlp_produces_attn_params",
        "from": "modules.adaln_mlp",
        "to": "value_sites.attn_params",
        "kind": "conditioning",
        "carries": [
          "representations.adaln_parameter_triplet"
        ],
        "operation": "split_attention_modulation_parameters",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiTBlock"
            }
          ]
        }
      },
      {
        "id": "adaln_mlp_produces_mlp_params",
        "from": "modules.adaln_mlp",
        "to": "value_sites.mlp_params",
        "kind": "conditioning",
        "carries": [
          "representations.adaln_parameter_triplet"
        ],
        "operation": "split_mlp_modulation_parameters",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiTBlock"
            }
          ]
        }
      },
      {
        "id": "norm1_enters_adaln_mod",
        "from": "modules.norm1",
        "to": "modules.adaln_mod",
        "kind": "data_flow",
        "carries": [
          "representations.token_state"
        ],
        "operation": "modulate_attention_input",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiTBlock"
            }
          ]
        }
      },
      {
        "id": "final_latent_enters_inverse_scaling",
        "from": "value_sites.final_latent",
        "to": "modules.inverse_latent_scaling",
        "kind": "data_flow",
        "carries": [
          "representations.final_latent"
        ],
        "operation": "prepare_vae_decode",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_sample_code",
              "role": "implementation_evidence",
              "locator": "main"
            }
          ]
        }
      },
      {
        "id": "inverse_scaling_produces_vae_decode_latent",
        "from": "modules.inverse_latent_scaling",
        "to": "value_sites.vae_decode_latent",
        "kind": "data_flow",
        "carries": [
          "representations.vae_decode_latent"
        ],
        "operation": "divide_by_0_18215",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_sample_code",
              "role": "implementation_evidence",
              "locator": "main"
            }
          ]
        }
      },
      {
        "id": "vae_decode_latent_enters_frozen_decoder",
        "from": "value_sites.vae_decode_latent",
        "to": "modules.frozen_vae_decoder",
        "kind": "data_flow",
        "carries": [
          "representations.vae_decode_latent"
        ],
        "operation": "vae_decode",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_sample_code",
              "role": "implementation_evidence",
              "locator": "main"
            }
          ]
        }
      },
      {
        "id": "frozen_decoder_produces_generated_image",
        "from": "modules.frozen_vae_decoder",
        "to": "value_sites.generated_image",
        "kind": "data_flow",
        "carries": [
          "representations.generated_image"
        ],
        "operation": "decode_pixels",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_sample_code",
              "role": "implementation_evidence",
              "locator": "main"
            }
          ]
        }
      },
      {
        "id": "initial_noise_initializes_current_latent",
        "from": "value_sites.initial_noise",
        "to": "value_sites.latent_before_step",
        "kind": "data_flow",
        "carries": [
          "representations.input_latent"
        ],
        "operation": "initialize_sampling_state",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_gaussian_diffusion_code",
              "role": "implementation_evidence",
              "locator": "p_sample_loop_progressive"
            }
          ]
        }
      },
      {
        "id": "current_latent_enters_reverse_diffusion_step",
        "from": "value_sites.latent_before_step",
        "to": "modules.reverse_diffusion_step",
        "kind": "data_flow",
        "carries": [
          "representations.input_latent"
        ],
        "operation": "reverse_diffusion_update",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_gaussian_diffusion_code",
              "role": "implementation_evidence",
              "locator": "p_mean_variance and p_sample"
            }
          ]
        }
      },
      {
        "id": "noise_prediction_enters_reverse_diffusion_step",
        "from": "value_sites.noise_prediction",
        "to": "modules.reverse_diffusion_step",
        "kind": "data_flow",
        "carries": [
          "representations.noise_prediction"
        ],
        "operation": "parameterize_reverse_distribution",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_gaussian_diffusion_code",
              "role": "implementation_evidence",
              "locator": "p_mean_variance"
            }
          ]
        }
      },
      {
        "id": "timestep_enters_reverse_diffusion_step",
        "from": "value_sites.timestep",
        "to": "modules.reverse_diffusion_step",
        "kind": "data_flow",
        "carries": [
          "representations.timestep"
        ],
        "operation": "select_diffusion_coefficients",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_gaussian_diffusion_code",
              "role": "implementation_evidence",
              "locator": "p_mean_variance and p_sample"
            }
          ]
        }
      },
      {
        "id": "step_noise_enters_reverse_diffusion_step",
        "from": "value_sites.step_noise",
        "to": "modules.reverse_diffusion_step",
        "kind": "data_flow",
        "carries": [
          "representations.step_noise"
        ],
        "operation": "stochastic_sampling",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_gaussian_diffusion_code",
              "role": "implementation_evidence",
              "locator": "p_sample"
            }
          ]
        }
      },
      {
        "id": "reverse_diffusion_step_updates_current_latent",
        "from": "modules.reverse_diffusion_step",
        "to": "value_sites.latent_after_step",
        "kind": "state_update",
        "carries": [
          "representations.input_latent"
        ],
        "operation": "update_sampling_state",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_gaussian_diffusion_code",
              "role": "implementation_evidence",
              "locator": "p_sample"
            }
          ]
        }
      },
      {
        "id": "updated_latent_reenters_sampling_iteration",
        "from": "value_sites.latent_after_step",
        "to": "value_sites.latent_before_step",
        "kind": "state_update",
        "carries": [
          "representations.input_latent"
        ],
        "operation": "loop_back_sampling_state",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_gaussian_diffusion_code",
              "role": "implementation_evidence",
              "locator": "p_sample_loop_progressive",
              "note": "Each yielded sample replaces the current image tensor for the next scheduled reverse step."
            }
          ]
        }
      },
      {
        "id": "current_latent_becomes_final_latent",
        "from": "value_sites.latent_after_step",
        "to": "value_sites.final_latent",
        "kind": "data_flow",
        "carries": [
          "representations.final_latent"
        ],
        "operation": "emit_final_sampling_state",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_gaussian_diffusion_code",
              "role": "implementation_evidence",
              "locator": "p_sample_loop_progressive"
            }
          ]
        }
      },
      {
        "id": "input_latent_patch_embedding",
        "from": "value_sites.latent_before_step",
        "to": "modules.patchify",
        "kind": "data_flow",
        "carries": [
          "representations.input_latent"
        ],
        "operation": "patch_embedding",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "dit_2022",
              "role": "supporting_evidence",
              "locator": "Sec. 3.2 (Patchify)"
            }
          ]
        }
      },
      {
        "id": "token_state_initialization",
        "from": "modules.patchify",
        "to": "value_sites.tokens_after_patchify",
        "kind": "data_flow",
        "carries": [
          "representations.token_state"
        ],
        "operation": "initialize_tokens_with_positional_embedding",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiT.forward"
            }
          ]
        }
      },
      {
        "id": "timestep_featurization",
        "from": "value_sites.timestep",
        "to": "modules.timestep_embedder",
        "kind": "conditioning",
        "carries": [
          "representations.timestep"
        ],
        "operation": "sinusoidal_embedding",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "TimestepEmbedder"
            }
          ]
        }
      },
      {
        "id": "timestep_embedding_projection",
        "from": "modules.timestep_embedder",
        "to": "value_sites.t_embedding",
        "kind": "conditioning",
        "carries": [
          "representations.t_embedding"
        ],
        "operation": "mlp_projection",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "TimestepEmbedder"
            }
          ]
        }
      },
      {
        "id": "class_label_featurization",
        "from": "value_sites.class_label",
        "to": "modules.label_embedder",
        "kind": "conditioning",
        "carries": [
          "representations.class_label"
        ],
        "operation": "label_embedding_with_cfg_dropout",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "LabelEmbedder"
            }
          ]
        }
      },
      {
        "id": "class_embedding_lookup",
        "from": "modules.label_embedder",
        "to": "value_sites.y_embedding",
        "kind": "conditioning",
        "carries": [
          "representations.y_embedding"
        ],
        "operation": "embedding_lookup",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "LabelEmbedder"
            }
          ]
        }
      },
      {
        "id": "timestep_conditioning_sum",
        "from": "value_sites.t_embedding",
        "to": "modules.cond_combiner",
        "kind": "conditioning",
        "carries": [
          "representations.t_embedding"
        ],
        "operation": "sum",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiT.forward"
            }
          ]
        }
      },
      {
        "id": "class_conditioning_sum",
        "from": "value_sites.y_embedding",
        "to": "modules.cond_combiner",
        "kind": "conditioning",
        "carries": [
          "representations.y_embedding"
        ],
        "operation": "sum",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiT.forward"
            }
          ]
        }
      },
      {
        "id": "conditioning_vector_initialization",
        "from": "modules.cond_combiner",
        "to": "value_sites.cond_vector",
        "kind": "conditioning",
        "carries": [
          "representations.cond_vector"
        ],
        "operation": "initialize_conditioning",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiT.forward"
            }
          ]
        }
      },
      {
        "id": "tokens_enter_block_stack",
        "from": "value_sites.tokens_after_patchify",
        "to": "value_sites.block_input_tokens",
        "kind": "data_flow",
        "carries": [
          "representations.token_state"
        ],
        "operation": "enter_dit_block_stack",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "dit_2022",
              "role": "supporting_evidence",
              "locator": "Sec. 3.2"
            }
          ]
        }
      },
      {
        "id": "tokens_enter_block_norm1",
        "from": "value_sites.block_input_tokens",
        "to": "modules.norm1",
        "kind": "data_flow",
        "carries": [
          "representations.token_state"
        ],
        "operation": "normalize_attention_input",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "dit_2022",
              "role": "supporting_evidence",
              "locator": "Sec. 3.2"
            }
          ]
        }
      },
      {
        "id": "cond_vector_enters_adaln_mlp",
        "from": "value_sites.cond_vector",
        "to": "modules.adaln_mlp",
        "kind": "conditioning",
        "carries": [
          "representations.cond_vector"
        ],
        "operation": "adaln_zero_modulation",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiTBlock"
            }
          ]
        }
      },
      {
        "id": "refined_tokens_to_final_layer",
        "from": "value_sites.tokens_after_blocks",
        "to": "modules.final_layer",
        "kind": "data_flow",
        "carries": [
          "representations.token_state"
        ],
        "operation": "decode_tokens",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiT.forward"
            }
          ]
        }
      },
      {
        "id": "final_layer_adaln_conditioning",
        "from": "value_sites.cond_vector",
        "to": "modules.final_layer",
        "kind": "conditioning",
        "carries": [
          "representations.cond_vector"
        ],
        "operation": "adaln_modulation",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "FinalLayer"
            }
          ]
        }
      },
      {
        "id": "output_token_linear_decode",
        "from": "modules.final_layer",
        "to": "value_sites.output_tokens",
        "kind": "data_flow",
        "carries": [
          "representations.output_tokens"
        ],
        "operation": "linear_decode",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "FinalLayer"
            }
          ]
        }
      },
      {
        "id": "output_token_layout_restoration",
        "from": "value_sites.output_tokens",
        "to": "modules.unpatchify",
        "kind": "data_flow",
        "carries": [
          "representations.output_tokens"
        ],
        "operation": "reshape",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiT.unpatchify"
            }
          ]
        }
      },
      {
        "id": "spatial_noise_prediction",
        "from": "modules.unpatchify",
        "to": "value_sites.noise_prediction",
        "kind": "data_flow",
        "carries": [
          "representations.noise_prediction"
        ],
        "operation": "predict",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiT.forward"
            },
            {
              "source_ref": "dit_gaussian_diffusion_code",
              "role": "implementation_evidence",
              "locator": "p_mean_variance"
            }
          ]
        }
      },
      {
        "id": "attn_params_enter_adaln_mod",
        "from": "value_sites.attn_params",
        "to": "modules.adaln_mod",
        "kind": "conditioning",
        "carries": [
          "representations.adaln_parameter_triplet"
        ],
        "operation": "apply_attention_shift_scale",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiTBlock"
            }
          ]
        }
      },
      {
        "id": "adaln_mod_enters_self_attention",
        "from": "modules.adaln_mod",
        "to": "modules.self_attention",
        "kind": "data_flow",
        "carries": [
          "representations.token_state"
        ],
        "operation": "full_self_attention",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiTBlock"
            }
          ]
        }
      },
      {
        "id": "self_attention_enters_gate1",
        "from": "modules.self_attention",
        "to": "modules.gate1",
        "kind": "data_flow",
        "carries": [
          "representations.token_state"
        ],
        "operation": "gate_attention_update",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiTBlock"
            }
          ]
        }
      },
      {
        "id": "attn_params_enter_gate1",
        "from": "value_sites.attn_params",
        "to": "modules.gate1",
        "kind": "conditioning",
        "carries": [
          "representations.adaln_parameter_triplet"
        ],
        "operation": "apply_attention_gate",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiTBlock"
            }
          ]
        }
      },
      {
        "id": "gate1_enters_add1",
        "from": "modules.gate1",
        "to": "modules.add1",
        "kind": "data_flow",
        "carries": [
          "representations.token_state"
        ],
        "operation": "attention_residual_update",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiTBlock"
            }
          ]
        }
      },
      {
        "id": "tokens_skip_to_add1",
        "from": "value_sites.block_input_tokens",
        "to": "modules.add1",
        "kind": "data_flow",
        "carries": [
          "representations.token_state"
        ],
        "operation": "attention_residual_skip",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiTBlock"
            }
          ]
        }
      },
      {
        "id": "add1_enters_norm2",
        "from": "modules.add1",
        "to": "modules.norm2",
        "kind": "data_flow",
        "carries": [
          "representations.token_state"
        ],
        "operation": "normalize_mlp_input",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiTBlock"
            }
          ]
        }
      },
      {
        "id": "norm2_enters_scale_shift2",
        "from": "modules.norm2",
        "to": "modules.scale_shift2",
        "kind": "data_flow",
        "carries": [
          "representations.token_state"
        ],
        "operation": "modulate_mlp_input",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiTBlock"
            }
          ]
        }
      },
      {
        "id": "mlp_params_enter_scale_shift2",
        "from": "value_sites.mlp_params",
        "to": "modules.scale_shift2",
        "kind": "conditioning",
        "carries": [
          "representations.adaln_parameter_triplet"
        ],
        "operation": "apply_mlp_shift_scale",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiTBlock"
            }
          ]
        }
      },
      {
        "id": "scale_shift2_enters_mlp_branch",
        "from": "modules.scale_shift2",
        "to": "modules.mlp_branch",
        "kind": "data_flow",
        "carries": [
          "representations.token_state"
        ],
        "operation": "feed_forward_update",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiTBlock"
            }
          ]
        }
      },
      {
        "id": "mlp_branch_enters_gate2",
        "from": "modules.mlp_branch",
        "to": "modules.gate2",
        "kind": "data_flow",
        "carries": [
          "representations.token_state"
        ],
        "operation": "gate_mlp_update",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiTBlock"
            }
          ]
        }
      },
      {
        "id": "mlp_params_enter_gate2",
        "from": "value_sites.mlp_params",
        "to": "modules.gate2",
        "kind": "conditioning",
        "carries": [
          "representations.adaln_parameter_triplet"
        ],
        "operation": "apply_mlp_gate",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiTBlock"
            }
          ]
        }
      },
      {
        "id": "gate2_enters_add2",
        "from": "modules.gate2",
        "to": "modules.add2",
        "kind": "data_flow",
        "carries": [
          "representations.token_state"
        ],
        "operation": "mlp_residual_update",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiTBlock"
            }
          ]
        }
      },
      {
        "id": "add1_skips_to_add2",
        "from": "modules.add1",
        "to": "modules.add2",
        "kind": "data_flow",
        "carries": [
          "representations.token_state"
        ],
        "operation": "mlp_residual_skip",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiTBlock"
            }
          ]
        }
      },
      {
        "id": "add2_produces_tokens_after_blocks",
        "from": "modules.add2",
        "to": "value_sites.tokens_after_blocks",
        "kind": "data_flow",
        "carries": [
          "representations.token_state"
        ],
        "operation": "emit_refined_tokens",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiTBlock"
            }
          ]
        }
      }
    ],
    "claims": [
      {
        "id": "adaln_zero_beats_alternatives",
        "statement": "adaLN-Zero conditioning outperformed in-context conditioning and cross-attention conditioning in the DiT block ablations.",
        "scope": {
          "module": "dit_blocks"
        },
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "dit_2022",
              "role": "supporting_evidence",
              "locator": "Sec. 3.2, Fig. 5"
            }
          ]
        }
      },
      {
        "id": "identity_initialization_helps",
        "statement": "Zero-initializing each block's entire six-output adaLN modulation linear makes all shifts, scale offsets, and gates initially zero; the zero gates make each block the identity at initialization, which accelerated training.",
        "scope": {
          "module": "dit_blocks"
        },
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "dit_2022",
              "role": "supporting_evidence",
              "locator": "Sec. 3.2"
            },
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiT.initialize_weights"
            }
          ]
        }
      },
      {
        "id": "conditioning_is_per_sample",
        "statement": "The conditioning vector is per-sample, not per-token; all tokens of a sample share the same modulation parameters, unlike per-item AdaLN.",
        "scope": {
          "module": "dit_blocks"
        },
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiTBlock",
              "note": "chunk(6, dim=1) on a B x d vector broadcasts over tokens."
            }
          ]
        }
      }
    ],
    "openQuestions": [
      {
        "id": "model_shared_vae_codec",
        "question": "Should the frozen VAE codec be extracted into a reusable architecture source shared by DiT inference decoding and training encoding?",
        "status": "unresolved",
        "affected_refs": [
          "modules.frozen_vae_decoder",
          "modules.inverse_latent_scaling"
        ],
        "blocking": false,
        "resolution_criteria": "Decide whether a reusable codec package can preserve the distinct training-encode and inference-decode occurrences without duplicating architecture facts.",
        "evidence": {
          "status": "open_question",
          "refs": [
            {
              "source_ref": "dit_sample_code",
              "role": "implementation_evidence",
              "locator": "main",
              "note": "The current source models only the inference-side decoder occurrence."
            }
          ]
        }
      },
      {
        "id": "model_cfg_execution",
        "question": "Should classifier-free guidance's paired conditional/unconditional forward passes be modeled explicitly in execution loops, or is a note enough?",
        "status": "unresolved",
        "affected_refs": [
          "execution.loops.denoising_loop",
          "conditioning.sampling_class_guidance"
        ],
        "blocking": false,
        "resolution_criteria": "Choose a representation that distinguishes paired CFG execution without duplicating the denoiser architecture.",
        "evidence": {
          "status": "open_question",
          "refs": [
            {
              "source_ref": "dit_models_code",
              "role": "implementation_evidence",
              "locator": "DiT.forward_with_cfg",
              "note": "The paired execution is confirmed; only its explanatory modeling remains unresolved."
            }
          ]
        }
      }
    ]
  },
  "bibliography": {
    "schemaVersion": "bibliography-v0.1",
    "sourceYaml": "../../references/bibliography.yaml",
    "sources": [
      {
        "id": "dit_2022",
        "kind": "paper",
        "title": "Scalable Diffusion Models with Transformers",
        "authors": [
          "William Peebles",
          "Saining Xie"
        ],
        "year": 2022,
        "identifiers": {
          "arxiv": "2212.09748"
        },
        "url": "https://arxiv.org/abs/2212.09748",
        "href": "https://arxiv.org/abs/2212.09748"
      },
      {
        "id": "dit_models_code",
        "kind": "code",
        "title": "DiT model implementation",
        "organization": "facebookresearch",
        "repository": "facebookresearch/DiT",
        "revision": "ed81ce2229091fd4ecc9a223645f95cf379d582b",
        "path": "facebookresearch/DiT/models.py",
        "url": "https://github.com/facebookresearch/DiT/blob/ed81ce2229091fd4ecc9a223645f95cf379d582b/models.py",
        "href": "https://github.com/facebookresearch/DiT/blob/ed81ce2229091fd4ecc9a223645f95cf379d582b/models.py"
      },
      {
        "id": "dit_sample_code",
        "kind": "code",
        "title": "DiT sampling entry point",
        "organization": "facebookresearch",
        "repository": "facebookresearch/DiT",
        "revision": "ed81ce2229091fd4ecc9a223645f95cf379d582b",
        "path": "facebookresearch/DiT/sample.py",
        "url": "https://github.com/facebookresearch/DiT/blob/ed81ce2229091fd4ecc9a223645f95cf379d582b/sample.py",
        "href": "https://github.com/facebookresearch/DiT/blob/ed81ce2229091fd4ecc9a223645f95cf379d582b/sample.py"
      },
      {
        "id": "dit_gaussian_diffusion_code",
        "kind": "code",
        "title": "DiT Gaussian diffusion implementation",
        "organization": "facebookresearch",
        "repository": "facebookresearch/DiT",
        "revision": "ed81ce2229091fd4ecc9a223645f95cf379d582b",
        "path": "facebookresearch/DiT/diffusion/gaussian_diffusion.py",
        "url": "https://github.com/facebookresearch/DiT/blob/ed81ce2229091fd4ecc9a223645f95cf379d582b/diffusion/gaussian_diffusion.py",
        "href": "https://github.com/facebookresearch/DiT/blob/ed81ce2229091fd4ecc9a223645f95cf379d582b/diffusion/gaussian_diffusion.py"
      },
      {
        "id": "dit_train_code",
        "kind": "code",
        "title": "DiT training entry point",
        "organization": "facebookresearch",
        "repository": "facebookresearch/DiT",
        "revision": "ed81ce2229091fd4ecc9a223645f95cf379d582b",
        "path": "facebookresearch/DiT/train.py",
        "url": "https://github.com/facebookresearch/DiT/blob/ed81ce2229091fd4ecc9a223645f95cf379d582b/train.py",
        "href": "https://github.com/facebookresearch/DiT/blob/ed81ce2229091fd4ecc9a223645f95cf379d582b/train.py"
      },
      {
        "id": "af2_2021",
        "kind": "paper",
        "title": "Highly accurate protein structure prediction with AlphaFold",
        "authors": [
          "John Jumper",
          "Richard Evans",
          "Alexander Pritzel",
          "Tim Green",
          "Michael Figurnov",
          "Olaf Ronneberger",
          "Kathryn Tunyasuvunakool",
          "Russ Bates",
          "Augustin Zidek",
          "Anna Potapenko",
          "Alex Bridgland",
          "Clemens Meyer",
          "Simon A. A. Kohl",
          "Andrew J. Ballard",
          "Andrew Cowie",
          "Bernardino Romera-Paredes",
          "Stanislav Nikolov",
          "Rishub Jain",
          "Jonas Adler",
          "Trevor Back",
          "Stig Petersen",
          "David Reiman",
          "Ellen Clancy",
          "Michal Zielinski",
          "Martin Steinegger",
          "Michalina Pacholska",
          "Tamas Berghammer",
          "Sebastian Bodenstein",
          "David Silver",
          "Oriol Vinyals",
          "Andrew W. Senior",
          "Koray Kavukcuoglu",
          "Pushmeet Kohli",
          "Demis Hassabis"
        ],
        "year": 2021,
        "identifiers": {
          "doi": "10.1038/s41586-021-03819-2"
        },
        "url": "https://www.nature.com/articles/s41586-021-03819-2",
        "href": "https://www.nature.com/articles/s41586-021-03819-2"
      },
      {
        "id": "af2_2021_supplement",
        "kind": "paper",
        "title": "Highly accurate protein structure prediction with AlphaFold: Supplementary Information",
        "authors": [
          "John Jumper",
          "Richard Evans",
          "Alexander Pritzel",
          "Tim Green",
          "Michael Figurnov",
          "Olaf Ronneberger",
          "Kathryn Tunyasuvunakool",
          "Russ Bates",
          "Augustin Zidek",
          "Anna Potapenko",
          "Alex Bridgland",
          "Clemens Meyer",
          "Simon A. A. Kohl",
          "Andrew J. Ballard",
          "Andrew Cowie",
          "Bernardino Romera-Paredes",
          "Stanislav Nikolov",
          "Rishub Jain",
          "Jonas Adler",
          "Trevor Back",
          "Stig Petersen",
          "David Reiman",
          "Ellen Clancy",
          "Michal Zielinski",
          "Martin Steinegger",
          "Michalina Pacholska",
          "Tamas Berghammer",
          "Sebastian Bodenstein",
          "David Silver",
          "Oriol Vinyals",
          "Andrew W. Senior",
          "Koray Kavukcuoglu",
          "Pushmeet Kohli",
          "Demis Hassabis"
        ],
        "year": 2021,
        "identifiers": {
          "doi": "10.1038/s41586-021-03819-2",
          "component": "supplementary_information"
        },
        "url": "https://static-content.springer.com/esm/art%3A10.1038%2Fs41586-021-03819-2/MediaObjects/41586_2021_3819_MOESM1_ESM.pdf",
        "href": "https://static-content.springer.com/esm/art%3A10.1038%2Fs41586-021-03819-2/MediaObjects/41586_2021_3819_MOESM1_ESM.pdf"
      },
      {
        "id": "af2_runner_code",
        "kind": "code",
        "title": "AlphaFold prediction and ranking entry point",
        "organization": "Google DeepMind",
        "repository": "google-deepmind/alphafold",
        "revision": "09ed0c5d5a32d794ed9f78b70906cbeaff0ef439",
        "path": "run_alphafold.py",
        "url": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/run_alphafold.py",
        "href": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/run_alphafold.py"
      },
      {
        "id": "af2_data_pipeline_code",
        "kind": "code",
        "title": "AlphaFold monomer input feature pipeline",
        "organization": "Google DeepMind",
        "repository": "google-deepmind/alphafold",
        "revision": "09ed0c5d5a32d794ed9f78b70906cbeaff0ef439",
        "path": "alphafold/data/pipeline.py",
        "url": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/data/pipeline.py",
        "href": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/data/pipeline.py"
      },
      {
        "id": "af2_model_wrapper_code",
        "kind": "code",
        "title": "AlphaFold model runner and monomer selection wrapper",
        "organization": "Google DeepMind",
        "repository": "google-deepmind/alphafold",
        "revision": "09ed0c5d5a32d794ed9f78b70906cbeaff0ef439",
        "path": "alphafold/model/model.py",
        "url": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/model/model.py",
        "href": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/model/model.py"
      },
      {
        "id": "af2_model_code",
        "kind": "code",
        "title": "AlphaFold monomer model and recycling implementation",
        "organization": "Google DeepMind",
        "repository": "google-deepmind/alphafold",
        "revision": "09ed0c5d5a32d794ed9f78b70906cbeaff0ef439",
        "path": "alphafold/model/modules.py",
        "url": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/model/modules.py",
        "href": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/model/modules.py"
      },
      {
        "id": "af2_structure_code",
        "kind": "code",
        "title": "AlphaFold monomer structure module",
        "organization": "Google DeepMind",
        "repository": "google-deepmind/alphafold",
        "revision": "09ed0c5d5a32d794ed9f78b70906cbeaff0ef439",
        "path": "alphafold/model/folding.py",
        "url": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/model/folding.py",
        "href": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/model/folding.py"
      },
      {
        "id": "af2_config_code",
        "kind": "code",
        "title": "AlphaFold model configuration",
        "organization": "Google DeepMind",
        "repository": "google-deepmind/alphafold",
        "revision": "09ed0c5d5a32d794ed9f78b70906cbeaff0ef439",
        "path": "alphafold/model/config.py",
        "url": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/model/config.py",
        "href": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/model/config.py"
      },
      {
        "id": "af2_relax_code",
        "kind": "code",
        "title": "AlphaFold Amber relaxation wrapper",
        "organization": "Google DeepMind",
        "repository": "google-deepmind/alphafold",
        "revision": "09ed0c5d5a32d794ed9f78b70906cbeaff0ef439",
        "path": "alphafold/relax/relax.py",
        "url": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/relax/relax.py",
        "href": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/relax/relax.py"
      },
      {
        "id": "genie2_2024",
        "kind": "paper",
        "title": "Out of Many, One: Designing and Scaffolding Proteins at the Scale of the Structural Universe with Genie 2",
        "authors": [
          "Yeqing Lin",
          "Minji Lee",
          "Zhao Zhang",
          "Mohammed AlQuraishi"
        ],
        "year": 2024,
        "identifiers": {
          "arxiv": "2405.15489"
        },
        "url": "https://arxiv.org/abs/2405.15489",
        "href": "https://arxiv.org/abs/2405.15489"
      },
      {
        "id": "genie2_model_code",
        "kind": "code",
        "title": "Genie 2 denoiser composition",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "genie/model/model.py",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/model.py",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/model.py"
      },
      {
        "id": "genie2_single_feature_code",
        "kind": "code",
        "title": "Genie 2 single-feature network",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "genie/model/single_feature_net.py",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/single_feature_net.py",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/single_feature_net.py"
      },
      {
        "id": "genie2_pair_feature_code",
        "kind": "code",
        "title": "Genie 2 pair-feature network",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "genie/model/pair_feature_net.py",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/pair_feature_net.py",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/pair_feature_net.py"
      },
      {
        "id": "genie2_pair_transform_code",
        "kind": "code",
        "title": "Genie 2 pair-transform network",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "genie/model/pair_transform_net.py",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/pair_transform_net.py",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/pair_transform_net.py"
      },
      {
        "id": "genie2_structure_code",
        "kind": "code",
        "title": "Genie 2 equivariant structure network",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "genie/model/structure_net.py",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/structure_net.py",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/structure_net.py"
      },
      {
        "id": "genie2_ipa_code",
        "kind": "code",
        "title": "Genie 2 invariant point attention module",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "genie/model/modules/invariant_point_attention.py",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/modules/invariant_point_attention.py",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/modules/invariant_point_attention.py"
      },
      {
        "id": "genie2_sampler_code",
        "kind": "code",
        "title": "Genie 2 reverse-diffusion sampler",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "genie/sampler/base.py",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/sampler/base.py",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/sampler/base.py"
      },
      {
        "id": "genie2_scaffold_sampler_code",
        "kind": "code",
        "title": "Genie 2 motif-scaffolding sampler",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "genie/sampler/scaffold.py",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/sampler/scaffold.py",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/sampler/scaffold.py"
      },
      {
        "id": "genie2_training_code",
        "kind": "code",
        "title": "Genie 2 diffusion training step",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "genie/diffusion/genie.py",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/diffusion/genie.py",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/diffusion/genie.py"
      },
      {
        "id": "genie2_config_code",
        "kind": "code",
        "title": "Genie 2 model and diffusion configuration",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "genie/config.py",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/config.py",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/config.py"
      },
      {
        "id": "genie2_base_config",
        "kind": "code",
        "title": "Genie 2 released base-checkpoint configuration",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "results/base/configuration",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/results/base/configuration",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/results/base/configuration"
      },
      {
        "id": "genie3_2026",
        "kind": "paper",
        "title": "Fast and Ultra-Capable Protein Design: Advancing the Frontier Through Atomistic SE(3)-Equivariance with Genie 3",
        "authors": [
          "Yeqing Lin",
          "Minji Lee",
          "Siddharth Vermani",
          "Yuwei Jiang",
          "Robbe De Cooman",
          "Bryan Spetko",
          "Mohammed AlQuraishi"
        ],
        "year": 2026,
        "identifiers": {
          "doi": "10.64898/2026.05.01.722168"
        },
        "url": "https://www.biorxiv.org/content/10.64898/2026.05.01.722168v1",
        "href": "https://www.biorxiv.org/content/10.64898/2026.05.01.722168v1"
      },
      {
        "id": "genie3_model_code",
        "kind": "code",
        "title": "Genie 3 V1 denoiser composition",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/model/implementation/v1.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/implementation/v1.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/implementation/v1.py"
      },
      {
        "id": "genie3_single_feature_code",
        "kind": "code",
        "title": "Genie 3 V1 single-feature embedder",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/model/embedder/single/v1.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/embedder/single/v1.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/embedder/single/v1.py"
      },
      {
        "id": "genie3_pair_feature_code",
        "kind": "code",
        "title": "Genie 3 V1 pair-feature embedder",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/model/embedder/pair/v1.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/embedder/pair/v1.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/embedder/pair/v1.py"
      },
      {
        "id": "genie3_latent_transformer_code",
        "kind": "code",
        "title": "Genie 3 latent transformer",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/model/latent/transformer.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/latent/transformer.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/latent/transformer.py"
      },
      {
        "id": "genie3_structure_code",
        "kind": "code",
        "title": "Genie 3 equivariant structure decoder",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/model/structure_net.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/structure_net.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/structure_net.py"
      },
      {
        "id": "genie3_ipa_code",
        "kind": "code",
        "title": "Genie 3 full and reduced invariant point attention modules",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/model/module/invariant_point_attention.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/module/invariant_point_attention.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/module/invariant_point_attention.py"
      },
      {
        "id": "genie3_sequence_code",
        "kind": "code",
        "title": "Genie 3 optional sequence head",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/model/sequence_net.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/sequence_net.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/sequence_net.py"
      },
      {
        "id": "genie3_geometry_code",
        "kind": "code",
        "title": "Genie 3 Frenet frame construction",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/utils/geo_utils.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/utils/geo_utils.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/utils/geo_utils.py"
      },
      {
        "id": "genie3_feature_code",
        "kind": "code",
        "title": "Genie 3 protein tokenization and conditioning features",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/utils/feat_utils.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/utils/feat_utils.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/utils/feat_utils.py"
      },
      {
        "id": "genie3_feature_schema_code",
        "kind": "code",
        "title": "Genie 3 feature dictionary registry",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/np/features.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/np/features.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/np/features.py"
      },
      {
        "id": "genie3_sample_dataset_registry_code",
        "kind": "code",
        "title": "Genie 3 generation task-source router",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/data/sample_dataset/registry.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/data/sample_dataset/registry.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/data/sample_dataset/registry.py"
      },
      {
        "id": "genie3_diffusion_code",
        "kind": "code",
        "title": "Genie 3 DDPM training objective",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/diffusion/ddpm.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/diffusion/ddpm.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/diffusion/ddpm.py"
      },
      {
        "id": "genie3_sampler_code",
        "kind": "code",
        "title": "Genie 3 base reverse-diffusion sampler",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/diffusion/sampler/sampler.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/diffusion/sampler/sampler.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/diffusion/sampler/sampler.py"
      },
      {
        "id": "genie3_ddim_code",
        "kind": "code",
        "title": "Genie 3 DDIM directional-scaling sampler",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/diffusion/sampler/ddim.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/diffusion/sampler/ddim.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/diffusion/sampler/ddim.py"
      },
      {
        "id": "genie3_config_code",
        "kind": "code",
        "title": "Genie 3 V1 architecture configuration",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/config/model/v1.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/config/model/v1.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/config/model/v1.py"
      },
      {
        "id": "genie3_export_code",
        "kind": "code",
        "title": "Genie 3 generated-structure postprocessing",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/runner/postprocess.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/runner/postprocess.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/runner/postprocess.py"
      },
      {
        "id": "generic_feature_refinement_source",
        "kind": "source",
        "title": "Generic Feature Refinement architecture source",
        "path": "architectures/generic-feature-refinement.yaml",
        "href": "../../architectures/generic-feature-refinement.yaml"
      },
      {
        "id": "architecture_language_protocol",
        "kind": "protocol",
        "title": "Architecture language protocol",
        "path": "protocol/architecture-language.md",
        "href": "../../protocol/architecture-language.md"
      }
    ]
  },
  "standardBlocks": {
    "adaln_zero_conditioning": {
      "id": "adaln_zero_conditioning",
      "schemaVersion": "standard-block-v0.1",
      "name": "AdaLN-Zero Conditioning",
      "sourceYaml": "../../standard_blocks/adaln-zero-conditioning.yaml",
      "description": "Regress per-sample shift, scale-offset, and residual-gate parameters from a global conditioning vector; the entire six-output modulation linear is zero-initialized, so each residual update starts at zero and the enclosing block starts as the identity.",
      "math": [
        {
          "id": "regress_modulation",
          "text": "shift1, scale1, gate1, shift2, scale2, gate2 = Linear(SiLU(c))",
          "tex": "\\beta_1, \\gamma_1, \\alpha_1, \\beta_2, \\gamma_2, \\alpha_2 = \\operatorname{Linear}(\\operatorname{SiLU}(c))",
          "operation": "conditioning_projection"
        },
        {
          "id": "modulate_attention_branch",
          "text": "h = x + gate1 * Attn((1 + scale1) * LN(x) + shift1)",
          "tex": "h = x + \\alpha_1 \\odot \\operatorname{Attn}((1 + \\gamma_1) \\odot \\operatorname{LN}(x) + \\beta_1)",
          "operation": "gated_residual_attention"
        },
        {
          "id": "modulate_mlp_branch",
          "text": "y = h + gate2 * MLP((1 + scale2) * LN(h) + shift2)",
          "tex": "y = h + \\alpha_2 \\odot \\operatorname{MLP}((1 + \\gamma_2) \\odot \\operatorname{LN}(h) + \\beta_2)",
          "operation": "gated_residual_mlp"
        },
        {
          "id": "identity_initialization",
          "text": "the six-output modulation linear's weights and bias are initialized to zero; zero residual gates make the block an identity",
          "operation": "initialization_policy"
        }
      ]
    },
    "sinusoidal_timestep_embedding": {
      "id": "sinusoidal_timestep_embedding",
      "schemaVersion": "standard-block-v0.1",
      "name": "Sinusoidal Timestep Embedding",
      "sourceYaml": "../../standard_blocks/sinusoidal-timestep-embedding.yaml",
      "description": "Expand a scalar diffusion timestep into a fixed sinusoidal frequency embedding, then project it to model width with a two-layer SiLU MLP. A reusable atom for diffusion-style architectures.",
      "math": [
        {
          "id": "frequencies",
          "text": "freqs = exp(-ln(10^4) * arange(128) / 128)",
          "tex": "\\omega_k = \\exp\\!\\left(-\\tfrac{k \\ln 10^4}{128}\\right),\\; k = 0..127",
          "operation": "frequency_table"
        },
        {
          "id": "sinusoid",
          "text": "emb = concat(cos(t * freqs), sin(t * freqs))  # 256-dim",
          "tex": "e = [\\cos(t\\,\\omega);\\; \\sin(t\\,\\omega)] \\in \\mathbb{R}^{256}",
          "operation": "sinusoidal_expansion"
        },
        {
          "id": "mlp_projection",
          "text": "t_emb = Linear_d(SiLU(Linear_d(emb)))",
          "tex": "t_{\\mathrm{emb}} = W_2\\,\\operatorname{SiLU}(W_1 e)",
          "operation": "mlp_projection"
        }
      ]
    },
    "per_item_adaln_conditioning": {
      "id": "per_item_adaln_conditioning",
      "schemaVersion": "standard-block-v0.1",
      "name": "Per-Item AdaLN Conditioning",
      "sourceYaml": "../../standard_blocks/per-item-adaln-conditioning.yaml",
      "description": "Use a per-item conditioning stream to produce adaptive normalization shifts, scales, and gates for item updates.",
      "math": [
        {
          "id": "normalize_item",
          "text": "u_i = LayerNorm(x_i)",
          "tex": "u_i = \\operatorname{LN}(x_i)",
          "operation": "normalize"
        },
        {
          "id": "project_conditioning",
          "text": "shift_i, scale_i, gate_i = Linear(s_i)",
          "tex": "\\beta_i, \\gamma_i, g_i = W s_i",
          "operation": "conditioning_projection"
        },
        {
          "id": "modulate",
          "text": "y_i = gate_i * (scale_i * u_i + shift_i)",
          "tex": "y_i = g_i \\odot (\\gamma_i \\odot u_i + \\beta_i)",
          "operation": "adaptive_modulation"
        }
      ]
    }
  },
  "pseudocode": {
    "diffusion_transformer": {
      "schemaVersion": "pseudocode-v0.1",
      "compilerVersion": "semantic-pseudocode-compiler-v0.3",
      "id": "diffusion_transformer",
      "title": "DiT Forward Pass Trace",
      "sources": [
        {
          "id": "dit_paper",
          "source_ref": "dit_2022"
        },
        {
          "id": "dit_code",
          "source_ref": "dit_models_code"
        }
      ],
      "scopes": [

      ],
      "symbols": [
        {
          "id": "initial_noise",
          "name": "x_T",
          "tex": "x_T",
          "type": "input",
          "shape": "B x 4 x I x I (I = image_size / 8)",
          "representationRef": "representations.initial_noise",
          "scale": "spatial",
          "architectureRef": "representations.initial_noise"
        },
        {
          "id": "step_noise",
          "name": "xi",
          "tex": "\\xi",
          "type": "input",
          "shape": "B x 4 x I x I",
          "representationRef": "representations.step_noise",
          "scale": "spatial",
          "architectureRef": "representations.step_noise"
        },
        {
          "id": "input_latent",
          "name": "x",
          "type": "input",
          "shape": "B x 4 x I x I (I = 32 for 256^2 images)",
          "representationRef": "representations.input_latent",
          "scale": "spatial",
          "architectureRef": "representations.input_latent"
        },
        {
          "id": "final_latent",
          "name": "x_0",
          "tex": "x_0",
          "type": "output",
          "shape": "B x 4 x I x I",
          "representationRef": "representations.final_latent",
          "scale": "spatial",
          "architectureRef": "representations.final_latent"
        },
        {
          "id": "vae_decode_latent",
          "name": "z_vae",
          "tex": "z_{\\mathrm{vae}}",
          "type": "representation",
          "shape": "B x 4 x I x I",
          "representationRef": "representations.vae_decode_latent",
          "scale": "spatial",
          "architectureRef": "representations.vae_decode_latent"
        },
        {
          "id": "generated_image",
          "name": "x_hat",
          "tex": "\\hat{x}",
          "type": "output",
          "shape": "B x 3 x H x W, H = W = 8I",
          "representationRef": "representations.generated_image",
          "scale": "output",
          "architectureRef": "representations.generated_image"
        },
        {
          "id": "timestep",
          "name": "t",
          "type": "input",
          "shape": "B",
          "representationRef": "representations.timestep",
          "scale": "sample",
          "architectureRef": "representations.timestep"
        },
        {
          "id": "class_label",
          "name": "y",
          "type": "input",
          "shape": "B",
          "representationRef": "representations.class_label",
          "scale": "sample",
          "architectureRef": "representations.class_label"
        },
        {
          "id": "t_embedding",
          "name": "t_emb",
          "tex": "t_{\\mathrm{emb}}",
          "type": "representation",
          "shape": "B x d",
          "representationRef": "representations.t_embedding",
          "scale": "sample",
          "architectureRef": "representations.t_embedding"
        },
        {
          "id": "y_embedding",
          "name": "y_emb",
          "tex": "y_{\\mathrm{emb}}",
          "type": "representation",
          "shape": "B x d",
          "representationRef": "representations.y_embedding",
          "scale": "sample",
          "architectureRef": "representations.y_embedding"
        },
        {
          "id": "cond_vector",
          "name": "c",
          "type": "representation",
          "shape": "B x d",
          "representationRef": "representations.cond_vector",
          "scale": "sample",
          "architectureRef": "representations.cond_vector"
        },
        {
          "id": "token_state",
          "name": "h",
          "type": "representation",
          "shape": "B x T x d, T = (I/p)^2",
          "representationRef": "representations.token_state",
          "scale": "token",
          "architectureRef": "representations.token_state"
        },
        {
          "id": "output_tokens",
          "name": "u",
          "type": "representation",
          "shape": "B x T x (p * p * C_out), C_out = 2C if learn_sigma else C",
          "representationRef": "representations.output_tokens",
          "scale": "token",
          "architectureRef": "representations.output_tokens"
        },
        {
          "id": "noise_prediction",
          "name": "ε, v",
          "tex": "\\varepsilon_\\theta, v_\\theta",
          "type": "output",
          "shape": "B x C_out x I x I, C_out = 2C if learn_sigma else C",
          "representationRef": "representations.noise_prediction",
          "scale": "spatial",
          "architectureRef": "representations.noise_prediction"
        }
      ],
      "lines": [
        {
          "id": "patchify_tokens",
          "text": "h = PatchEmbed(x) + pos_embed  # fixed 2D sin-cos",
          "refs": "DiT.forward",
          "sourceRefs": [
            {
              "source": "dit_code",
              "locator": "DiT.forward"
            }
          ],
          "architectureRefs": [
            "modules.patchify"
          ],
          "operation": "patch_embedding",
          "inputs": [
            "input_latent"
          ],
          "outputs": [
            "token_state"
          ]
        },
        {
          "id": "embed_timestep",
          "text": "t_emb = MLP(SinCosEmbed_256(t))",
          "refs": "TimestepEmbedder",
          "sourceRefs": [
            {
              "source": "dit_code",
              "locator": "TimestepEmbedder"
            }
          ],
          "architectureRefs": [
            "modules.timestep_embedder"
          ],
          "operation": "sinusoidal_embedding",
          "inputs": [
            "timestep"
          ],
          "outputs": [
            "t_embedding"
          ]
        },
        {
          "id": "embed_label",
          "text": "y_emb = Embedding(maybe_drop_to_null(y))  # training-only dropout; CFG supplies null labels at inference",
          "refs": "LabelEmbedder",
          "sourceRefs": [
            {
              "source": "dit_code",
              "locator": "LabelEmbedder"
            }
          ],
          "architectureRefs": [
            "modules.label_embedder"
          ],
          "operation": "label_embedding_with_cfg_dropout",
          "inputs": [
            "class_label"
          ],
          "outputs": [
            "y_embedding"
          ]
        },
        {
          "id": "combine_conditioning",
          "text": "c = t_emb + y_emb",
          "refs": "DiT.forward",
          "sourceRefs": [
            {
              "source": "dit_code",
              "locator": "DiT.forward"
            }
          ],
          "architectureRefs": [
            "modules.cond_combiner",
            "claims.conditioning_is_per_sample"
          ],
          "operation": "sum",
          "inputs": [
            "t_embedding",
            "y_embedding"
          ],
          "outputs": [
            "cond_vector"
          ]
        },
        {
          "id": "run_blocks",
          "text": "for block in blocks: h = DiTBlock(h, c)  # adaLN-Zero, 28 blocks in DiT-XL",
          "refs": "DiTBlock",
          "sourceRefs": [
            {
              "source": "dit_code",
              "locator": "DiTBlock"
            }
          ],
          "architectureRefs": [
            "modules.dit_blocks",
            "claims.adaln_zero_beats_alternatives"
          ],
          "standardBlockRef": "../../standard_blocks/adaln-zero-conditioning.yaml",
          "operation": "adaln_zero",
          "inputs": [
            "token_state",
            "cond_vector"
          ],
          "outputs": [
            "token_state"
          ],
          "visual": {
            "block": "adaln_zero_conditioning",
            "slots": {
              "token_state": "token_state",
              "cond_vector": "cond_vector"
            }
          }
        },
        {
          "id": "decode_tokens",
          "text": "shift, scale = Linear(SiLU(c)); u = Linear((1 + scale) * LayerNorm(h) + shift)",
          "refs": "FinalLayer",
          "sourceRefs": [
            {
              "source": "dit_code",
              "locator": "FinalLayer"
            }
          ],
          "architectureRefs": [
            "modules.final_layer"
          ],
          "operation": "linear_decode",
          "inputs": [
            "token_state",
            "cond_vector"
          ],
          "outputs": [
            "output_tokens"
          ]
        },
        {
          "id": "unpatchify_output",
          "text": "out = Unpatchify(u); eps, var_values = split(out) if learn_sigma else (out, None)",
          "refs": "DiT.unpatchify",
          "sourceRefs": [
            {
              "source": "dit_code",
              "locator": "DiT.unpatchify"
            }
          ],
          "architectureRefs": [
            "modules.unpatchify"
          ],
          "operation": "reshape",
          "inputs": [
            "output_tokens"
          ],
          "outputs": [
            "noise_prediction"
          ]
        }
      ],
      "claims": [
        {
          "id": "modulation_broadcasts_over_tokens",
          "statement": "The modulation parameters are regressed once per sample from c and broadcast over all tokens; no token-resolved conditioning enters the block stack.",
          "line_refs": [
            "combine_conditioning",
            "run_blocks"
          ],
          "evidence": {
            "status": "confirmed_from_code",
            "refs": [
              {
                "source_ref": "dit_models_code",
                "role": "implementation_evidence",
                "locator": "DiTBlock",
                "note": "chunk(6, dim=1) on a B x d conditioning vector."
              }
            ]
          }
        }
      ],
      "sourceYaml": "../../pseudocode/diffusion-transformer.yaml"
    }
  },
  "boards": {
    "schemaVersion": "visualization-v0.4",
    "sourceYaml": "../../views/dit-semantic-zoom.view.yaml",
    "rootBoard": "generation_overview",
    "items": [
      {
        "id": "generation_overview",
        "title": "DiT Class-Conditional Image Generation",
        "summary": "DiT generates an image by iteratively denoising a random four-channel latent under a class label, undoing the latent scaling used during training, and decoding the final latent with a frozen VAE.",
        "subject_ref": "architecture",
        "expansion_depth": 1,
        "grid": {
          "columns": 8,
          "rows": 4,
          "column_sizing": "content"
        },
        "nodes": [
          {
            "id": "class_label",
            "ref": "value_sites.class_label",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "col": 1,
            "row": 1
          },
          {
            "id": "initial_noise",
            "ref": "value_sites.initial_noise",
            "prominence": "context",
            "col": 1,
            "row": 3
          },
          {
            "id": "ddpm_sampler",
            "ref": "modules.ddpm_sampler",
            "prominence": "primary",
            "treatment": "block",
            "board_ref": "sampling_loop",
            "col": 3,
            "row": 2
          },
          {
            "id": "final_latent",
            "ref": "value_sites.final_latent",
            "prominence": "secondary",
            "col": 4,
            "row": 2
          },
          {
            "id": "frozen_vae_decoder",
            "ref": "modules.frozen_vae_decoder",
            "prominence": "primary",
            "treatment": "block",
            "col": 7,
            "row": 2
          },
          {
            "id": "generated_image",
            "ref": "value_sites.generated_image",
            "prominence": "primary",
            "col": 8,
            "row": 2
          }
        ],
        "elide": [
          {
            "ref": "modules.inverse_latent_scaling"
          },
          {
            "ref": "value_sites.vae_decode_latent"
          }
        ],
        "edge_overrides": [
          {
            "match": {
              "relation_ref": "relations.initial_noise_initializes_current_latent"
            },
            "label": "x_T",
            "connection": {
              "title": "Initial sampling noise",
              "role": "reverse-chain initialization",
              "inside": "Generation begins from a four-channel standard-normal latent at the frozen VAE's spatial resolution."
            }
          },
          {
            "match": {
              "relation_ref": "relations.class_label_featurization"
            },
            "label": "class y",
            "tone": "conditioning",
            "connection": {
              "title": "Class-conditioned sampling",
              "role": "classifier-free guidance input",
              "inside": "The requested class conditions every DiT evaluation; the reference sampler pairs it with a null-class copy for classifier-free guidance."
            }
          },
          {
            "match": {
              "relation_ref": "relations.current_latent_becomes_final_latent"
            },
            "label": "x_0",
            "connection": {
              "title": "Final denoised latent",
              "role": "reverse-chain output",
              "inside": "After the configured reverse-diffusion steps, the sampler returns the final four-channel latent."
            }
          },
          {
            "match": {
              "relation_path": [
                "relations.final_latent_enters_inverse_scaling",
                "relations.inverse_scaling_produces_vae_decode_latent",
                "relations.vae_decode_latent_enters_frozen_decoder"
              ]
            },
            "label": "decoder latent",
            "connection": {
              "title": "Latent into frozen decoder",
              "role": "latent-to-pixel decoding",
              "inside": "The rescaled four-channel latent is passed to the frozen pretrained VAE decoder."
            }
          },
          {
            "match": {
              "relation_ref": "relations.frozen_decoder_produces_generated_image"
            },
            "label": "RGB image",
            "connection": {
              "title": "Generated image",
              "role": "task-level output",
              "inside": "The frozen VAE maps the final latent back to an RGB image at the requested resolution."
            }
          }
        ],
        "notes": [
          "This root presents the generation path. Training has a separate image-to-latent noising path.",
          "Fixed inverse scaling is authored but elided from the high-level view; its dashed connection remains inspectable."
        ],
        "projection_mode": "derived",
        "edges": [
          {
            "id": "projection_2209e561a97f",
            "from": "class_label",
            "to": "ddpm_sampler",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.class_label_featurization"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.class_label_featurization"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.class_label"
            ],
            "presentation": {
              "label": "class y",
              "tone": "conditioning",
              "connection": {
                "title": "Class-conditioned sampling",
                "role": "classifier-free guidance input",
                "inside": "The requested class conditions every DiT evaluation; the reference sampler pairs it with a null-class copy for classifier-free guidance."
              }
            }
          },
          {
            "id": "projection_0ee6739b7e0a",
            "from": "ddpm_sampler",
            "to": "final_latent",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.current_latent_becomes_final_latent"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.current_latent_becomes_final_latent"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.final_latent"
            ],
            "presentation": {
              "label": "x_0",
              "connection": {
                "title": "Final denoised latent",
                "role": "reverse-chain output",
                "inside": "After the configured reverse-diffusion steps, the sampler returns the final four-channel latent."
              }
            }
          },
          {
            "id": "projection_b640c78ad13d",
            "from": "final_latent",
            "to": "frozen_vae_decoder",
            "projection": "contracted",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.final_latent_enters_inverse_scaling",
              "relations.inverse_scaling_produces_vae_decode_latent",
              "relations.vae_decode_latent_enters_frozen_decoder"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.final_latent_enters_inverse_scaling"
              },
              {
                "relation_ref": "relations.inverse_scaling_produces_vae_decode_latent"
              },
              {
                "relation_ref": "relations.vae_decode_latent_enters_frozen_decoder"
              }
            ],
            "hidden_refs": [
              "modules.inverse_latent_scaling",
              "value_sites.vae_decode_latent"
            ],
            "carries": [
              "representations.final_latent",
              "representations.vae_decode_latent"
            ],
            "presentation": {
              "label": "decoder latent",
              "connection": {
                "title": "Latent into frozen decoder",
                "role": "latent-to-pixel decoding",
                "inside": "The rescaled four-channel latent is passed to the frozen pretrained VAE decoder."
              }
            }
          },
          {
            "id": "projection_49872b434d7a",
            "from": "frozen_vae_decoder",
            "to": "generated_image",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.frozen_decoder_produces_generated_image"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.frozen_decoder_produces_generated_image"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.generated_image"
            ],
            "presentation": {
              "label": "RGB image",
              "connection": {
                "title": "Generated image",
                "role": "task-level output",
                "inside": "The frozen VAE maps the final latent back to an RGB image at the requested resolution."
              }
            }
          },
          {
            "id": "projection_ba8c287802ef",
            "from": "initial_noise",
            "to": "ddpm_sampler",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.initial_noise_initializes_current_latent"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.initial_noise_initializes_current_latent"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.input_latent"
            ],
            "presentation": {
              "label": "x_T",
              "connection": {
                "title": "Initial sampling noise",
                "role": "reverse-chain initialization",
                "inside": "Generation begins from a four-channel standard-normal latent at the frozen VAE's spatial resolution."
              }
            }
          }
        ],
        "classifications": {
          "modules.adaln_mlp": "collapsed:modules.ddpm_sampler",
          "modules.adaln_mod": "collapsed:modules.ddpm_sampler",
          "modules.add1": "collapsed:modules.ddpm_sampler",
          "modules.add2": "collapsed:modules.ddpm_sampler",
          "modules.cond_combiner": "collapsed:modules.ddpm_sampler",
          "modules.ddpm_sampler": "visible",
          "modules.final_layer": "collapsed:modules.ddpm_sampler",
          "modules.frozen_vae_decoder": "visible",
          "modules.gate1": "collapsed:modules.ddpm_sampler",
          "modules.gate2": "collapsed:modules.ddpm_sampler",
          "modules.inverse_latent_scaling": "elided",
          "modules.label_embedder": "collapsed:modules.ddpm_sampler",
          "modules.mlp_branch": "collapsed:modules.ddpm_sampler",
          "modules.norm1": "collapsed:modules.ddpm_sampler",
          "modules.norm2": "collapsed:modules.ddpm_sampler",
          "modules.patchify": "collapsed:modules.ddpm_sampler",
          "modules.reverse_diffusion_step": "collapsed:modules.ddpm_sampler",
          "modules.scale_shift2": "collapsed:modules.ddpm_sampler",
          "modules.self_attention": "collapsed:modules.ddpm_sampler",
          "modules.timestep_embedder": "collapsed:modules.ddpm_sampler",
          "modules.unpatchify": "collapsed:modules.ddpm_sampler",
          "value_sites.attn_params": "collapsed:modules.ddpm_sampler",
          "value_sites.block_input_tokens": "collapsed:modules.ddpm_sampler",
          "value_sites.class_label": "visible",
          "value_sites.cond_vector": "collapsed:modules.ddpm_sampler",
          "value_sites.final_latent": "visible",
          "value_sites.generated_image": "visible",
          "value_sites.initial_noise": "visible",
          "value_sites.latent_after_step": "collapsed:modules.ddpm_sampler",
          "value_sites.latent_before_step": "collapsed:modules.ddpm_sampler",
          "value_sites.mlp_params": "collapsed:modules.ddpm_sampler",
          "value_sites.noise_prediction": "collapsed:modules.ddpm_sampler",
          "value_sites.output_tokens": "collapsed:modules.ddpm_sampler",
          "value_sites.step_noise": "collapsed:modules.ddpm_sampler",
          "value_sites.t_embedding": "collapsed:modules.ddpm_sampler",
          "value_sites.timestep": "collapsed:modules.ddpm_sampler",
          "value_sites.tokens_after_blocks": "collapsed:modules.ddpm_sampler",
          "value_sites.tokens_after_patchify": "collapsed:modules.ddpm_sampler",
          "value_sites.vae_decode_latent": "elided",
          "value_sites.y_embedding": "collapsed:modules.ddpm_sampler"
        },
        "projectionMode": "derived"
      },
      {
        "id": "sampling_loop",
        "title": "DDPM Sampling Loop",
        "summary": "This is the denoising iteration repeated by the sampler. DiT predicts noise and learned-range variance parameters from x_t, t, and y; a fixed DDPM formula uses that prediction, the current latent, schedule coefficients, and fresh noise to produce x_(t-1). The loop starts with x_T as Gaussian noise and ends when the updated state is x_0.",
        "parent": "generation_overview",
        "subject_ref": "modules.ddpm_sampler",
        "expansion_depth": 1,
        "grid": {
          "columns": 9,
          "rows": 5,
          "min_col": 150,
          "col_gap": 30
        },
        "nodes": [
          {
            "id": "class_label",
            "ref": "value_sites.class_label",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "col": 3,
            "row": 1
          },
          {
            "id": "timestep",
            "ref": "value_sites.timestep",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "col": 5,
            "row": 1
          },
          {
            "id": "step_noise",
            "ref": "value_sites.step_noise",
            "label": "Fresh step noise",
            "prominence": "context",
            "col": 7,
            "row": 1
          },
          {
            "id": "current_latent",
            "ref": "value_sites.latent_before_step",
            "label": "Current latent x_t",
            "prominence": "secondary",
            "col": 1,
            "row": 3
          },
          {
            "id": "dit_denoiser_call",
            "ref": "modules.dit_denoiser",
            "label": "DiT Noise Predictor",
            "scale": "spatial",
            "role": "learned network that estimates the noise present in x_t",
            "detail": "learned · (epsilon, variance) = DiT(x_t, t, y)",
            "prominence": "primary",
            "treatment": "block",
            "board_ref": "dit_pipeline",
            "col": 3,
            "row": 3
          },
          {
            "id": "noise_prediction",
            "ref": "value_sites.noise_prediction",
            "label": "Predicted noise + variance",
            "prominence": "secondary",
            "col": 5,
            "row": 3
          },
          {
            "id": "reverse_diffusion_step",
            "ref": "modules.reverse_diffusion_step",
            "label": "DDPM Formula · Fixed Math",
            "detail": "fixed sampler math · no learned weights",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 7,
            "row": 3
          },
          {
            "id": "next_latent",
            "ref": "value_sites.latent_after_step",
            "label": "Next latent x_(t-1)",
            "prominence": "secondary",
            "col": 9,
            "row": 3
          }
        ],
        "exclude": [
          {
            "ref": "value_sites.initial_noise",
            "reason": "The parent overview establishes the initial x_T boundary."
          },
          {
            "ref": "value_sites.final_latent",
            "reason": "The parent overview shows how the final x_0 leaves the completed sampling loop."
          }
        ],
        "edge_overrides": [
          {
            "match": {
              "relation_ref": "relations.input_latent_patch_embedding"
            },
            "label": "x_t",
            "connection": {
              "title": "Current latent into DiT",
              "role": "denoiser state",
              "inside": "At each iteration, the current four-channel latent becomes the DiT backbone's spatial input."
            }
          },
          {
            "match": {
              "relation_ref": "relations.spatial_noise_prediction"
            },
            "label": "prediction",
            "connection": {
              "title": "Learned DiT prediction",
              "role": "learned reverse-process parameters",
              "inside": "DiT returns a spatial epsilon prediction and optional learned-range variance parameters; it does not itself calculate x_(t-1)."
            }
          },
          {
            "match": {
              "relation_ref": "relations.class_label_featurization"
            },
            "label": "class y",
            "tone": "conditioning",
            "connection": {
              "title": "Class label into DiT",
              "role": "class conditioning",
              "inside": "The reference guidance path evaluates class-conditional and null-class examples together around this learned prediction."
            }
          },
          {
            "match": {
              "relation_ref": "relations.timestep_featurization"
            },
            "label": "timestep t",
            "tone": "conditioning",
            "connection": {
              "title": "Timestep into DiT",
              "role": "noise-level conditioning",
              "inside": "DiT embeds the current scheduled timestep to condition every block and its final layer."
            }
          },
          {
            "match": {
              "relation_ref": "relations.current_latent_enters_reverse_diffusion_step"
            },
            "label": "current x_t",
            "tone": "skip",
            "route_side": "bottom",
            "route_clearance": 18,
            "connection": {
              "title": "Current latent into the fixed formula",
              "role": "sampler state bypass",
              "inside": "The DDPM equation needs the original current latent as well as DiT's prediction; this lower rail is a data dependency, not another model pass."
            }
          },
          {
            "match": {
              "relation_ref": "relations.noise_prediction_enters_reverse_diffusion_step"
            },
            "label": "eps, variance",
            "connection": {
              "title": "Prediction into the fixed formula",
              "role": "learned parameters used by sampler math",
              "inside": "Predicted noise determines the denoised estimate, while the learned-range output selects the reverse-process variance used by the fixed equation."
            }
          },
          {
            "match": {
              "relation_ref": "relations.timestep_enters_reverse_diffusion_step"
            },
            "label": "schedule t",
            "connection": {
              "title": "Timestep into the fixed formula",
              "role": "schedule lookup",
              "inside": "The timestep selects the precomputed coefficients and determines whether the stochastic term is active; no learned weights are involved."
            }
          },
          {
            "match": {
              "relation_ref": "relations.step_noise_enters_reverse_diffusion_step"
            },
            "label": "fresh xi",
            "connection": {
              "title": "Stochastic DDPM noise",
              "role": "reverse-step randomness",
              "inside": "Fresh standard-normal noise is scaled by the selected reverse variance for t greater than zero; it is masked out at t equals zero."
            }
          },
          {
            "match": {
              "relation_ref": "relations.reverse_diffusion_step_updates_current_latent"
            },
            "label": "x_(t-1)",
            "connection": {
              "title": "Formula result",
              "role": "one-step sampler output",
              "inside": "Applying the DDPM equation produces x_(t-1); on the last scheduled iteration this state is x_0."
            }
          },
          {
            "match": {
              "relation_ref": "relations.updated_latent_reenters_sampling_iteration"
            },
            "label": "repeat at next scheduled t",
            "tone": "skip",
            "route_side": "bottom",
            "route_clearance": 36,
            "connection": {
              "title": "Repeat with the updated latent",
              "role": "recurrent sampler state",
              "inside": "If steps remain, x_(t-1) becomes the next iteration's x_t and the sampler advances to the next scheduled timestep."
            }
          }
        ],
        "notes": [
          "The root board owns the boundary: the first current latent is Gaussian x_T, and the final next latent is emitted as x_0 for VAE decoding.",
          "The official sampler batches conditional and null-class copies for classifier-free guidance; the reproducibility path guides only the first three epsilon channels.",
          "The 250 sampler indices map onto a respaced subset of the 1,000-step training schedule."
        ],
        "projection_mode": "derived",
        "edges": [
          {
            "id": "projection_a901ebe1dd70",
            "from": "class_label",
            "to": "dit_denoiser_call",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.class_label_featurization"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.class_label_featurization"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.class_label"
            ],
            "presentation": {
              "label": "class y",
              "tone": "conditioning",
              "connection": {
                "title": "Class label into DiT",
                "role": "class conditioning",
                "inside": "The reference guidance path evaluates class-conditional and null-class examples together around this learned prediction."
              }
            }
          },
          {
            "id": "projection_11a735ade1a2",
            "from": "current_latent",
            "to": "dit_denoiser_call",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.input_latent_patch_embedding"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.input_latent_patch_embedding"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.input_latent"
            ],
            "presentation": {
              "label": "x_t",
              "connection": {
                "title": "Current latent into DiT",
                "role": "denoiser state",
                "inside": "At each iteration, the current four-channel latent becomes the DiT backbone's spatial input."
              }
            }
          },
          {
            "id": "projection_57158e5f44fa",
            "from": "current_latent",
            "to": "reverse_diffusion_step",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.current_latent_enters_reverse_diffusion_step"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.current_latent_enters_reverse_diffusion_step"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.input_latent"
            ],
            "presentation": {
              "label": "current x_t",
              "tone": "skip",
              "route_side": "bottom",
              "route_clearance": 18,
              "connection": {
                "title": "Current latent into the fixed formula",
                "role": "sampler state bypass",
                "inside": "The DDPM equation needs the original current latent as well as DiT's prediction; this lower rail is a data dependency, not another model pass."
              }
            }
          },
          {
            "id": "projection_4a31bbc4da86",
            "from": "dit_denoiser_call",
            "to": "noise_prediction",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.spatial_noise_prediction"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.spatial_noise_prediction"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.noise_prediction"
            ],
            "presentation": {
              "label": "prediction",
              "connection": {
                "title": "Learned DiT prediction",
                "role": "learned reverse-process parameters",
                "inside": "DiT returns a spatial epsilon prediction and optional learned-range variance parameters; it does not itself calculate x_(t-1)."
              }
            }
          },
          {
            "id": "projection_0307ddf5071f",
            "from": "next_latent",
            "to": "current_latent",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.updated_latent_reenters_sampling_iteration"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.updated_latent_reenters_sampling_iteration"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.input_latent"
            ],
            "presentation": {
              "label": "repeat at next scheduled t",
              "tone": "skip",
              "route_side": "bottom",
              "route_clearance": 36,
              "connection": {
                "title": "Repeat with the updated latent",
                "role": "recurrent sampler state",
                "inside": "If steps remain, x_(t-1) becomes the next iteration's x_t and the sampler advances to the next scheduled timestep."
              }
            }
          },
          {
            "id": "projection_564f025da7da",
            "from": "noise_prediction",
            "to": "reverse_diffusion_step",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.noise_prediction_enters_reverse_diffusion_step"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.noise_prediction_enters_reverse_diffusion_step"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.noise_prediction"
            ],
            "presentation": {
              "label": "eps, variance",
              "connection": {
                "title": "Prediction into the fixed formula",
                "role": "learned parameters used by sampler math",
                "inside": "Predicted noise determines the denoised estimate, while the learned-range output selects the reverse-process variance used by the fixed equation."
              }
            }
          },
          {
            "id": "projection_a69022d439d0",
            "from": "reverse_diffusion_step",
            "to": "next_latent",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.reverse_diffusion_step_updates_current_latent"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.reverse_diffusion_step_updates_current_latent"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.input_latent"
            ],
            "presentation": {
              "label": "x_(t-1)",
              "connection": {
                "title": "Formula result",
                "role": "one-step sampler output",
                "inside": "Applying the DDPM equation produces x_(t-1); on the last scheduled iteration this state is x_0."
              }
            }
          },
          {
            "id": "projection_9d118cd5a29f",
            "from": "step_noise",
            "to": "reverse_diffusion_step",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.step_noise_enters_reverse_diffusion_step"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.step_noise_enters_reverse_diffusion_step"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.step_noise"
            ],
            "presentation": {
              "label": "fresh xi",
              "connection": {
                "title": "Stochastic DDPM noise",
                "role": "reverse-step randomness",
                "inside": "Fresh standard-normal noise is scaled by the selected reverse variance for t greater than zero; it is masked out at t equals zero."
              }
            }
          },
          {
            "id": "projection_dfc4c79c3e03",
            "from": "timestep",
            "to": "dit_denoiser_call",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.timestep_featurization"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.timestep_featurization"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.timestep"
            ],
            "presentation": {
              "label": "timestep t",
              "tone": "conditioning",
              "connection": {
                "title": "Timestep into DiT",
                "role": "noise-level conditioning",
                "inside": "DiT embeds the current scheduled timestep to condition every block and its final layer."
              }
            }
          },
          {
            "id": "projection_849bfe5e3320",
            "from": "timestep",
            "to": "reverse_diffusion_step",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.timestep_enters_reverse_diffusion_step"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.timestep_enters_reverse_diffusion_step"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.timestep"
            ],
            "presentation": {
              "label": "schedule t",
              "connection": {
                "title": "Timestep into the fixed formula",
                "role": "schedule lookup",
                "inside": "The timestep selects the precomputed coefficients and determines whether the stochastic term is active; no learned weights are involved."
              }
            }
          }
        ],
        "classifications": {
          "modules.adaln_mlp": "collapsed:modules.dit_denoiser",
          "modules.adaln_mod": "collapsed:modules.dit_denoiser",
          "modules.add1": "collapsed:modules.dit_denoiser",
          "modules.add2": "collapsed:modules.dit_denoiser",
          "modules.cond_combiner": "collapsed:modules.dit_denoiser",
          "modules.dit_denoiser": "visible",
          "modules.final_layer": "collapsed:modules.dit_denoiser",
          "modules.gate1": "collapsed:modules.dit_denoiser",
          "modules.gate2": "collapsed:modules.dit_denoiser",
          "modules.label_embedder": "collapsed:modules.dit_denoiser",
          "modules.mlp_branch": "collapsed:modules.dit_denoiser",
          "modules.norm1": "collapsed:modules.dit_denoiser",
          "modules.norm2": "collapsed:modules.dit_denoiser",
          "modules.patchify": "collapsed:modules.dit_denoiser",
          "modules.reverse_diffusion_step": "visible",
          "modules.scale_shift2": "collapsed:modules.dit_denoiser",
          "modules.self_attention": "collapsed:modules.dit_denoiser",
          "modules.timestep_embedder": "collapsed:modules.dit_denoiser",
          "modules.unpatchify": "collapsed:modules.dit_denoiser",
          "value_sites.attn_params": "collapsed:modules.dit_denoiser",
          "value_sites.block_input_tokens": "collapsed:modules.dit_denoiser",
          "value_sites.class_label": "visible",
          "value_sites.cond_vector": "collapsed:modules.dit_denoiser",
          "value_sites.final_latent": "excluded",
          "value_sites.initial_noise": "excluded",
          "value_sites.latent_after_step": "visible",
          "value_sites.latent_before_step": "visible",
          "value_sites.mlp_params": "collapsed:modules.dit_denoiser",
          "value_sites.noise_prediction": "visible",
          "value_sites.output_tokens": "collapsed:modules.dit_denoiser",
          "value_sites.step_noise": "visible",
          "value_sites.t_embedding": "collapsed:modules.dit_denoiser",
          "value_sites.timestep": "visible",
          "value_sites.tokens_after_blocks": "collapsed:modules.dit_denoiser",
          "value_sites.tokens_after_patchify": "collapsed:modules.dit_denoiser",
          "value_sites.y_embedding": "collapsed:modules.dit_denoiser"
        },
        "projectionMode": "derived"
      },
      {
        "id": "dit_pipeline",
        "title": "DiT-XL/2 Denoiser Forward Pass",
        "summary": "One sampler iteration calls DiT-XL/2 on x_t, t, and y. The denoiser patchifies the latent, builds the conditioning vector, runs 28 adaLN-Zero blocks with 16 attention heads, then returns epsilon and learned-range variance parameters to the fixed DDPM sampling formula.",
        "parent": "sampling_loop",
        "subject_ref": "modules.dit_denoiser",
        "expansion_depth": 1,
        "grid": {
          "columns": 8,
          "rows": 5
        },
        "nodes": [
          {
            "id": "timestep",
            "ref": "value_sites.timestep",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "col": 1,
            "row": 1
          },
          {
            "id": "class_label",
            "ref": "value_sites.class_label",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "col": 1,
            "row": 2
          },
          {
            "id": "input_latent",
            "ref": "value_sites.latent_before_step",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "col": 1,
            "row": 4
          },
          {
            "id": "timestep_embedder",
            "ref": "modules.timestep_embedder",
            "treatment": "compact",
            "density": "compact",
            "col": 2,
            "row": 1
          },
          {
            "id": "label_embedder",
            "ref": "modules.label_embedder",
            "treatment": "compact",
            "density": "compact",
            "col": 2,
            "row": 2
          },
          {
            "id": "cond_combiner",
            "ref": "modules.cond_combiner",
            "label": "t + y",
            "col": 3,
            "row": 1
          },
          {
            "id": "patchify",
            "ref": "modules.patchify",
            "treatment": "compact",
            "density": "compact",
            "col": 2,
            "row": 4
          },
          {
            "id": "cond_vector",
            "ref": "value_sites.cond_vector",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 4,
            "row": 1
          },
          {
            "id": "token_state",
            "ref": "value_sites.tokens_after_patchify",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 3,
            "row": 4
          },
          {
            "id": "dit_blocks",
            "ref": "modules.dit_blocks",
            "prominence": "primary",
            "treatment": "block",
            "col": 5,
            "row": 3,
            "board_ref": "dit_blocks"
          },
          {
            "id": "final_layer",
            "ref": "modules.final_layer",
            "prominence": "primary",
            "treatment": "compact",
            "density": "compact",
            "col": 7,
            "row": 3
          },
          {
            "id": "unpatchify",
            "ref": "modules.unpatchify",
            "treatment": "compact",
            "density": "compact",
            "col": 8,
            "row": 4
          },
          {
            "id": "noise_prediction",
            "ref": "value_sites.noise_prediction",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "col": 8,
            "row": 3
          }
        ],
        "elide": [
          {
            "ref": "value_sites.t_embedding"
          },
          {
            "ref": "value_sites.y_embedding"
          },
          {
            "ref": "value_sites.tokens_after_blocks"
          },
          {
            "ref": "value_sites.output_tokens"
          }
        ],
        "exclude": [
          {
            "ref": "modules.reverse_diffusion_step",
            "reason": "The parent sampling board explains how the fixed DDPM formula consumes the denoiser prediction."
          }
        ],
        "edge_overrides": [
          {
            "match": {
              "relation_ref": "relations.timestep_featurization"
            },
            "label": "t",
            "connection": {
              "title": "Timestep into embedder",
              "role": "noise-level featurization",
              "inside": "The scalar timestep is expanded with a 256-dim sinusoidal embedding and projected by a two-layer SiLU MLP."
            }
          },
          {
            "match": {
              "relation_path": [
                "relations.timestep_embedding_projection",
                "relations.timestep_conditioning_sum"
              ]
            },
            "label": "t emb",
            "connection": {
              "title": "Timestep embedding into combiner",
              "role": "additive combination",
              "inside": "Timestep and label embeddings are summed elementwise; no gating or concatenation."
            }
          },
          {
            "match": {
              "relation_ref": "relations.class_label_featurization"
            },
            "label": "y",
            "connection": {
              "title": "Label into embedder",
              "role": "class featurization",
              "inside": "The class index is looked up in an embedding table; during training labels randomly drop to a null class for classifier-free guidance."
            }
          },
          {
            "match": {
              "relation_path": [
                "relations.class_embedding_lookup",
                "relations.class_conditioning_sum"
              ]
            },
            "label": "y emb",
            "connection": {
              "title": "Label embedding into combiner",
              "role": "additive combination",
              "inside": "Timestep and label embeddings are summed elementwise; no gating or concatenation."
            }
          },
          {
            "match": {
              "relation_ref": "relations.conditioning_vector_initialization"
            },
            "label": "c",
            "tone": "conditioning",
            "connection": {
              "title": "Conditioning vector",
              "role": "read-only conditioning source",
              "inside": "The summed vector c = t_emb + y_emb is per-sample and is never updated by the block stack."
            }
          },
          {
            "match": {
              "relation_ref": "relations.input_latent_patch_embedding"
            },
            "label": "latent",
            "connection": {
              "title": "Noised latent into patchify",
              "role": "patch featurization",
              "inside": "The spatial latent is cut into p x p patches, each linearly embedded into one token."
            }
          },
          {
            "match": {
              "relation_ref": "relations.token_state_initialization"
            },
            "label": "tokens + pos",
            "connection": {
              "title": "Token initialization",
              "role": "mutable token stream",
              "inside": "Patch tokens receive fixed 2D sin-cos positional embeddings; this is the only mutable state in the forward pass."
            }
          },
          {
            "match": {
              "relation_ref": "relations.cond_vector_enters_adaln_mlp"
            },
            "label": "c",
            "tone": "conditioning",
            "connection": {
              "title": "adaLN-Zero conditioning",
              "role": "per-sample modulation of every block",
              "inside": "Each block's zero-initialized six-output linear regresses shift, scale offsets, and residual gates from c; modulation uses (1 + scale) times LayerNorm plus shift."
            }
          },
          {
            "match": {
              "relation_ref": "relations.tokens_enter_block_stack"
            },
            "label": "x",
            "connection": {
              "title": "Tokens into the block stack",
              "role": "coarse mutable state",
              "inside": "Full self-attention over all patch tokens updates the token stream block by block."
            }
          },
          {
            "match": {
              "relation_path": [
                "relations.add2_produces_tokens_after_blocks",
                "relations.refined_tokens_to_final_layer"
              ]
            },
            "label": "refined tokens",
            "connection": {
              "title": "Refined tokens to decoder",
              "role": "token decoding",
              "inside": "The final layer normalizes tokens with adaLN-modulated LayerNorm before the linear decode."
            }
          },
          {
            "match": {
              "relation_ref": "relations.final_layer_adaln_conditioning"
            },
            "label": "c",
            "tone": "conditioning",
            "connection": {
              "title": "Final-layer adaLN",
              "role": "shift/scale modulation",
              "inside": "The final layer regresses shift and scale (no gate) from c before decoding."
            }
          },
          {
            "match": {
              "relation_path": [
                "relations.output_token_linear_decode",
                "relations.output_token_layout_restoration"
              ]
            },
            "label": "reshape",
            "connection": {
              "title": "Tokens into unpatchify",
              "role": "layout restoration",
              "inside": "Per-token patch predictions are rearranged back to the spatial latent grid; this is a lossless reshape."
            }
          },
          {
            "match": {
              "relation_ref": "relations.spatial_noise_prediction"
            },
            "label": "eps, variance params",
            "connection": {
              "title": "Noise and variance-parameter prediction",
              "role": "final outputs",
              "inside": "Unpatchify returns one joint spatial tensor; the diffusion wrapper treats the first C channels as epsilon and, when enabled, the second C as learned-range variance parameters."
            }
          }
        ],
        "notes": [
          "Intermediate timestep, label, and output-token representations are elided; the canonical modules remain visible on the main board."
        ],
        "projection_mode": "derived",
        "edges": [
          {
            "id": "projection_b5c2d4cfca21",
            "from": "class_label",
            "to": "label_embedder",
            "projection": "direct",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.class_label_featurization"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.class_label_featurization"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.class_label"
            ],
            "presentation": {
              "label": "y",
              "connection": {
                "title": "Label into embedder",
                "role": "class featurization",
                "inside": "The class index is looked up in an embedding table; during training labels randomly drop to a null class for classifier-free guidance."
              }
            }
          },
          {
            "id": "projection_c411d7293b1e",
            "from": "cond_combiner",
            "to": "cond_vector",
            "projection": "direct",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.conditioning_vector_initialization"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.conditioning_vector_initialization"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.cond_vector"
            ],
            "presentation": {
              "label": "c",
              "tone": "conditioning",
              "connection": {
                "title": "Conditioning vector",
                "role": "read-only conditioning source",
                "inside": "The summed vector c = t_emb + y_emb is per-sample and is never updated by the block stack."
              }
            }
          },
          {
            "id": "projection_d6b3a551044f",
            "from": "cond_vector",
            "to": "dit_blocks",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.cond_vector_enters_adaln_mlp"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.cond_vector_enters_adaln_mlp"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.cond_vector"
            ],
            "presentation": {
              "label": "c",
              "tone": "conditioning",
              "connection": {
                "title": "adaLN-Zero conditioning",
                "role": "per-sample modulation of every block",
                "inside": "Each block's zero-initialized six-output linear regresses shift, scale offsets, and residual gates from c; modulation uses (1 + scale) times LayerNorm plus shift."
              }
            }
          },
          {
            "id": "projection_85fe11532bea",
            "from": "cond_vector",
            "to": "final_layer",
            "projection": "direct",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.final_layer_adaln_conditioning"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.final_layer_adaln_conditioning"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.cond_vector"
            ],
            "presentation": {
              "label": "c",
              "tone": "conditioning",
              "connection": {
                "title": "Final-layer adaLN",
                "role": "shift/scale modulation",
                "inside": "The final layer regresses shift and scale (no gate) from c before decoding."
              }
            }
          },
          {
            "id": "projection_66c7068e9f72",
            "from": "dit_blocks",
            "to": "final_layer",
            "projection": "contracted",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.add2_produces_tokens_after_blocks",
              "relations.refined_tokens_to_final_layer"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.add2_produces_tokens_after_blocks"
              },
              {
                "relation_ref": "relations.refined_tokens_to_final_layer"
              }
            ],
            "hidden_refs": [
              "value_sites.tokens_after_blocks"
            ],
            "carries": [
              "representations.token_state"
            ],
            "presentation": {
              "label": "refined tokens",
              "connection": {
                "title": "Refined tokens to decoder",
                "role": "token decoding",
                "inside": "The final layer normalizes tokens with adaLN-modulated LayerNorm before the linear decode."
              }
            }
          },
          {
            "id": "projection_3208a02aa978",
            "from": "final_layer",
            "to": "unpatchify",
            "projection": "contracted",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.output_token_linear_decode",
              "relations.output_token_layout_restoration"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.output_token_linear_decode"
              },
              {
                "relation_ref": "relations.output_token_layout_restoration"
              }
            ],
            "hidden_refs": [
              "value_sites.output_tokens"
            ],
            "carries": [
              "representations.output_tokens"
            ],
            "presentation": {
              "label": "reshape",
              "connection": {
                "title": "Tokens into unpatchify",
                "role": "layout restoration",
                "inside": "Per-token patch predictions are rearranged back to the spatial latent grid; this is a lossless reshape."
              }
            }
          },
          {
            "id": "projection_74b974f2f27f",
            "from": "input_latent",
            "to": "patchify",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.input_latent_patch_embedding"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.input_latent_patch_embedding"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.input_latent"
            ],
            "presentation": {
              "label": "latent",
              "connection": {
                "title": "Noised latent into patchify",
                "role": "patch featurization",
                "inside": "The spatial latent is cut into p x p patches, each linearly embedded into one token."
              }
            }
          },
          {
            "id": "projection_7417dc7bd61b",
            "from": "label_embedder",
            "to": "cond_combiner",
            "projection": "contracted",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.class_embedding_lookup",
              "relations.class_conditioning_sum"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.class_embedding_lookup"
              },
              {
                "relation_ref": "relations.class_conditioning_sum"
              }
            ],
            "hidden_refs": [
              "value_sites.y_embedding"
            ],
            "carries": [
              "representations.y_embedding"
            ],
            "presentation": {
              "label": "y emb",
              "connection": {
                "title": "Label embedding into combiner",
                "role": "additive combination",
                "inside": "Timestep and label embeddings are summed elementwise; no gating or concatenation."
              }
            }
          },
          {
            "id": "projection_3861842a06f8",
            "from": "patchify",
            "to": "token_state",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.token_state_initialization"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.token_state_initialization"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.token_state"
            ],
            "presentation": {
              "label": "tokens + pos",
              "connection": {
                "title": "Token initialization",
                "role": "mutable token stream",
                "inside": "Patch tokens receive fixed 2D sin-cos positional embeddings; this is the only mutable state in the forward pass."
              }
            }
          },
          {
            "id": "projection_ecd6ec0370a6",
            "from": "timestep",
            "to": "timestep_embedder",
            "projection": "direct",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.timestep_featurization"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.timestep_featurization"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.timestep"
            ],
            "presentation": {
              "label": "t",
              "connection": {
                "title": "Timestep into embedder",
                "role": "noise-level featurization",
                "inside": "The scalar timestep is expanded with a 256-dim sinusoidal embedding and projected by a two-layer SiLU MLP."
              }
            }
          },
          {
            "id": "projection_142bb70493cc",
            "from": "timestep_embedder",
            "to": "cond_combiner",
            "projection": "contracted",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.timestep_embedding_projection",
              "relations.timestep_conditioning_sum"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.timestep_embedding_projection"
              },
              {
                "relation_ref": "relations.timestep_conditioning_sum"
              }
            ],
            "hidden_refs": [
              "value_sites.t_embedding"
            ],
            "carries": [
              "representations.t_embedding"
            ],
            "presentation": {
              "label": "t emb",
              "connection": {
                "title": "Timestep embedding into combiner",
                "role": "additive combination",
                "inside": "Timestep and label embeddings are summed elementwise; no gating or concatenation."
              }
            }
          },
          {
            "id": "projection_299a2efe452e",
            "from": "token_state",
            "to": "dit_blocks",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.tokens_enter_block_stack"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.tokens_enter_block_stack"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.token_state"
            ],
            "presentation": {
              "label": "x",
              "connection": {
                "title": "Tokens into the block stack",
                "role": "coarse mutable state",
                "inside": "Full self-attention over all patch tokens updates the token stream block by block."
              }
            }
          },
          {
            "id": "projection_eedb69b94e9d",
            "from": "unpatchify",
            "to": "noise_prediction",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.spatial_noise_prediction"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.spatial_noise_prediction"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.noise_prediction"
            ],
            "presentation": {
              "label": "eps, variance params",
              "connection": {
                "title": "Noise and variance-parameter prediction",
                "role": "final outputs",
                "inside": "Unpatchify returns one joint spatial tensor; the diffusion wrapper treats the first C channels as epsilon and, when enabled, the second C as learned-range variance parameters."
              }
            }
          }
        ],
        "classifications": {
          "modules.adaln_mlp": "collapsed:modules.dit_blocks",
          "modules.adaln_mod": "collapsed:modules.dit_blocks",
          "modules.add1": "collapsed:modules.dit_blocks",
          "modules.add2": "collapsed:modules.dit_blocks",
          "modules.cond_combiner": "visible",
          "modules.dit_blocks": "visible",
          "modules.final_layer": "visible",
          "modules.gate1": "collapsed:modules.dit_blocks",
          "modules.gate2": "collapsed:modules.dit_blocks",
          "modules.label_embedder": "visible",
          "modules.mlp_branch": "collapsed:modules.dit_blocks",
          "modules.norm1": "collapsed:modules.dit_blocks",
          "modules.norm2": "collapsed:modules.dit_blocks",
          "modules.patchify": "visible",
          "modules.reverse_diffusion_step": "excluded",
          "modules.scale_shift2": "collapsed:modules.dit_blocks",
          "modules.self_attention": "collapsed:modules.dit_blocks",
          "modules.timestep_embedder": "visible",
          "modules.unpatchify": "visible",
          "value_sites.attn_params": "collapsed:modules.dit_blocks",
          "value_sites.block_input_tokens": "collapsed:modules.dit_blocks",
          "value_sites.class_label": "visible",
          "value_sites.cond_vector": "visible",
          "value_sites.latent_before_step": "visible",
          "value_sites.mlp_params": "collapsed:modules.dit_blocks",
          "value_sites.noise_prediction": "visible",
          "value_sites.output_tokens": "elided",
          "value_sites.t_embedding": "elided",
          "value_sites.timestep": "visible",
          "value_sites.tokens_after_blocks": "elided",
          "value_sites.tokens_after_patchify": "visible",
          "value_sites.y_embedding": "elided"
        },
        "projectionMode": "derived"
      },
      {
        "id": "dit_blocks",
        "title": "DiT-XL Block (adaLN-Zero)",
        "summary": "One of the 28 DiT-XL blocks. A SiLU-plus-linear projection on c emits six vectors: shift1, scale1, gate1 for the attention branch and shift2, scale2, gate2 for the MLP branch. Each branch applies (1 + scale) times LayerNorm plus shift, transforms, gates, then adds residually.",
        "parent": "dit_pipeline",
        "subject_ref": "modules.dit_blocks",
        "expansion_depth": 1,
        "grid": {
          "columns": 12,
          "rows": 4,
          "column_sizing": "content",
          "min_col": 88,
          "col_gap": 48
        },
        "nodes": [
          {
            "id": "token_state_in",
            "ref": "value_sites.block_input_tokens",
            "label": "tokens in",
            "col": 1,
            "row": 4
          },
          {
            "id": "cond_vector",
            "ref": "value_sites.cond_vector",
            "col": 2,
            "row": 1
          },
          {
            "id": "adaln_mlp",
            "ref": "modules.adaln_mlp",
            "label": "adaLN modulation",
            "scale": "sample",
            "treatment": "compact",
            "density": "compact",
            "role": "apply SiLU then a linear projection from c to six modulation vectors",
            "detail": "c -> shift1, scale1, gate1, shift2, scale2, gate2",
            "col": 4,
            "row": 1
          },
          {
            "id": "attn_params",
            "ref": "value_sites.attn_params",
            "label": "branch-1 params",
            "scale": "sample",
            "treatment": "chip",
            "density": "micro",
            "role": "shift1, scale1, and gate1 modulate the attention residual branch",
            "col": 3,
            "row": 2
          },
          {
            "id": "mlp_params",
            "ref": "value_sites.mlp_params",
            "label": "branch-2 params",
            "scale": "sample",
            "treatment": "chip",
            "density": "micro",
            "role": "shift2, scale2, and gate2 modulate the pointwise MLP residual branch",
            "col": 8,
            "row": 2
          },
          {
            "id": "norm1",
            "ref": "modules.norm1",
            "label": "LayerNorm",
            "scale": "token",
            "treatment": "chip",
            "density": "micro",
            "role": "normalize tokens before the attention branch; no learned affine",
            "col": 2,
            "row": 4
          },
          {
            "id": "adaln_mod",
            "ref": "modules.adaln_mod",
            "label": "modulate 1",
            "scale": "token",
            "treatment": "chip",
            "density": "micro",
            "role": "affine modulation",
            "detail": "(1 + scale1) * norm1 + shift1",
            "col": 3,
            "row": 4
          },
          {
            "id": "self_attention",
            "ref": "modules.self_attention",
            "label": "self-attention",
            "scale": "token",
            "treatment": "compact",
            "density": "compact",
            "role": "16-head full self-attention inside one DiT-XL block",
            "detail": "standard QKV attention plus output projection",
            "col": 4,
            "row": 4
          },
          {
            "id": "gate1",
            "ref": "modules.gate1",
            "operator": "*",
            "label": "gate1",
            "scale": "token",
            "role": "multiply the attention output by the zero-initialized gate1 vector",
            "col": 5,
            "row": 4
          },
          {
            "id": "add1",
            "ref": "modules.add1",
            "operator": "+",
            "label": "residual add 1",
            "scale": "token",
            "role": "add the gated attention branch back to the incoming token state",
            "col": 6,
            "row": 4
          },
          {
            "id": "norm2",
            "ref": "modules.norm2",
            "label": "LayerNorm",
            "scale": "token",
            "treatment": "chip",
            "density": "micro",
            "role": "normalize the post-attention token state before the MLP branch",
            "col": 7,
            "row": 4
          },
          {
            "id": "scale_shift2",
            "ref": "modules.scale_shift2",
            "label": "modulate 2",
            "scale": "token",
            "treatment": "chip",
            "density": "micro",
            "role": "affine modulation",
            "detail": "(1 + scale2) * norm2 + shift2",
            "col": 8,
            "row": 4
          },
          {
            "id": "mlp_branch",
            "ref": "modules.mlp_branch",
            "label": "pointwise MLP branch",
            "scale": "token",
            "treatment": "compact",
            "density": "compact",
            "role": "transform each token independently with the DiT MLP branch",
            "col": 9,
            "row": 4
          },
          {
            "id": "gate2",
            "ref": "modules.gate2",
            "operator": "*",
            "label": "gate2",
            "scale": "token",
            "role": "multiply the MLP output by the zero-initialized gate2 vector",
            "col": 10,
            "row": 4
          },
          {
            "id": "add2",
            "ref": "modules.add2",
            "operator": "+",
            "label": "residual add 2",
            "scale": "token",
            "role": "add the gated MLP branch back to the post-attention token state",
            "col": 11,
            "row": 4
          },
          {
            "id": "token_state_out",
            "ref": "value_sites.tokens_after_blocks",
            "label": "tokens out",
            "col": 12,
            "row": 4
          }
        ],
        "exclude": [
          {
            "ref": "value_sites.tokens_after_patchify",
            "reason": "This board starts at the block-stack interface after the parent denoiser hands off patch tokens."
          },
          {
            "ref": "modules.final_layer",
            "reason": "The parent denoiser board explains how the completed block stack is decoded into output patches."
          }
        ],
        "edge_overrides": [
          {
            "match": {
              "relation_ref": "relations.cond_vector_enters_adaln_mlp"
            },
            "label": "c",
            "tone": "conditioning",
            "connection": {
              "title": "Conditioning into adaLN modulation",
              "role": "modulation source",
              "inside": "The per-sample conditioning vector c passes through SiLU and one joint linear to produce six vectors; that entire linear's weights and bias are initialized to zero."
            }
          },
          {
            "match": {
              "relation_ref": "relations.adaln_mlp_produces_attn_params"
            },
            "label": "1st branch",
            "tone": "conditioning",
            "connection": {
              "title": "Attention-branch parameters",
              "role": "adaLN-Zero branch controls",
              "inside": "The first three chunks are shift1, scale1, and gate1; they modulate and gate the self-attention branch."
            }
          },
          {
            "match": {
              "relation_ref": "relations.adaln_mlp_produces_mlp_params"
            },
            "label": "2nd branch",
            "tone": "conditioning",
            "connection": {
              "title": "MLP-branch parameters",
              "role": "adaLN-Zero branch controls",
              "inside": "The last three chunks are shift2, scale2, and gate2; they modulate and gate the pointwise MLP branch."
            }
          },
          {
            "match": {
              "relation_ref": "relations.tokens_enter_block_norm1"
            },
            "label": "x",
            "connection": {
              "title": "Tokens into first LayerNorm",
              "role": "branch input",
              "inside": "The incoming token state is first LayerNorm-normalized for the attention residual branch."
            }
          },
          {
            "match": {
              "relation_ref": "relations.norm1_enters_adaln_mod"
            },
            "label": "norm1",
            "connection": {
              "title": "Normalized tokens",
              "role": "normalized branch input",
              "inside": "DiT uses LayerNorm without learned affine parameters before applying adaptive shift and scale from c."
            }
          },
          {
            "match": {
              "relation_ref": "relations.attn_params_enter_adaln_mod"
            },
            "label": "shift1, scale1",
            "tone": "conditioning",
            "connection": {
              "title": "First adaLN shift and scale",
              "role": "attention-branch modulation",
              "inside": "shift1 and scale1 are broadcast over tokens as (1 + scale1) * LayerNorm(x) + shift1 before self-attention."
            }
          },
          {
            "match": {
              "relation_ref": "relations.adaln_mod_enters_self_attention"
            },
            "label": "modulated x",
            "connection": {
              "title": "Modulated tokens into attention",
              "role": "attention input",
              "inside": "The shifted and scaled token stream enters full multi-head self-attention."
            }
          },
          {
            "match": {
              "relation_ref": "relations.self_attention_enters_gate1"
            },
            "label": "attn",
            "connection": {
              "title": "Attention branch output",
              "role": "residual branch value",
              "inside": "The attention branch output is not added directly; it is first multiplied by gate1."
            }
          },
          {
            "match": {
              "relation_ref": "relations.attn_params_enter_gate1"
            },
            "label": "gate1",
            "tone": "conditioning",
            "connection": {
              "title": "First residual gate",
              "role": "zero-initialized branch gate",
              "inside": "gate1 is one output of the jointly zero-initialized six-vector modulation linear, so the attention branch initially contributes nothing."
            }
          },
          {
            "match": {
              "relation_ref": "relations.gate1_enters_add1"
            },
            "label": "gate1*attn",
            "connection": {
              "title": "Gated attention update",
              "role": "gated residual update",
              "inside": "The gated attention output is the update term for the first residual add."
            }
          },
          {
            "match": {
              "relation_ref": "relations.tokens_skip_to_add1"
            },
            "label": "skip x",
            "tone": "skip",
            "connection": {
              "title": "First residual skip",
              "role": "residual identity path",
              "inside": "The original token state bypasses the attention branch and is added to the gated attention update."
            }
          },
          {
            "match": {
              "relation_ref": "relations.add1_enters_norm2"
            },
            "label": "x1",
            "connection": {
              "title": "Post-attention state",
              "role": "second branch input",
              "inside": "The output of the first residual add becomes the input to the MLP residual branch."
            }
          },
          {
            "match": {
              "relation_ref": "relations.norm2_enters_scale_shift2"
            },
            "label": "norm2",
            "connection": {
              "title": "Normalized post-attention tokens",
              "role": "normalized branch input",
              "inside": "The post-attention token state is LayerNorm-normalized before the second adaptive shift and scale."
            }
          },
          {
            "match": {
              "relation_ref": "relations.mlp_params_enter_scale_shift2"
            },
            "label": "shift2, scale2",
            "tone": "conditioning",
            "connection": {
              "title": "Second adaLN shift and scale",
              "role": "MLP-branch modulation",
              "inside": "shift2 and scale2 are broadcast over tokens as (1 + scale2) * LayerNorm(x1) + shift2 before the pointwise MLP branch."
            }
          },
          {
            "match": {
              "relation_ref": "relations.scale_shift2_enters_mlp_branch"
            },
            "label": "modulated x1",
            "connection": {
              "title": "Modulated tokens into MLP",
              "role": "MLP input",
              "inside": "The second shifted and scaled token stream enters the pointwise feed-forward branch."
            }
          },
          {
            "match": {
              "relation_ref": "relations.mlp_branch_enters_gate2"
            },
            "label": "mlp",
            "connection": {
              "title": "MLP branch output",
              "role": "residual branch value",
              "inside": "The pointwise MLP output is multiplied by gate2 before the second residual add."
            }
          },
          {
            "match": {
              "relation_ref": "relations.mlp_params_enter_gate2"
            },
            "label": "gate2",
            "tone": "conditioning",
            "connection": {
              "title": "Second residual gate",
              "role": "zero-initialized branch gate",
              "inside": "gate2 is another output of the jointly zero-initialized modulation linear, so the MLP branch initially contributes nothing."
            }
          },
          {
            "match": {
              "relation_ref": "relations.gate2_enters_add2"
            },
            "label": "gate2*mlp",
            "connection": {
              "title": "Gated MLP update",
              "role": "gated residual update",
              "inside": "The gated MLP output is the update term for the second residual add."
            }
          },
          {
            "match": {
              "relation_ref": "relations.add1_skips_to_add2"
            },
            "label": "skip x1",
            "tone": "skip",
            "connection": {
              "title": "Second residual skip",
              "role": "residual identity path",
              "inside": "The post-attention state bypasses the MLP branch and is added to the gated MLP update."
            }
          },
          {
            "match": {
              "relation_ref": "relations.add2_produces_tokens_after_blocks"
            },
            "label": "x out",
            "connection": {
              "title": "Updated tokens",
              "role": "mutable output",
              "inside": "The block returns tokens with the same shape and ownership; at initialization both gates are zero, so the whole block starts as an identity map."
            }
          }
        ],
        "projection_mode": "derived",
        "edges": [
          {
            "id": "projection_9279d175a3a4",
            "from": "adaln_mlp",
            "to": "attn_params",
            "projection": "direct",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.adaln_mlp_produces_attn_params"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.adaln_mlp_produces_attn_params"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.adaln_parameter_triplet"
            ],
            "presentation": {
              "label": "1st branch",
              "tone": "conditioning",
              "connection": {
                "title": "Attention-branch parameters",
                "role": "adaLN-Zero branch controls",
                "inside": "The first three chunks are shift1, scale1, and gate1; they modulate and gate the self-attention branch."
              }
            }
          },
          {
            "id": "projection_cfbe4bf0cb27",
            "from": "adaln_mlp",
            "to": "mlp_params",
            "projection": "direct",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.adaln_mlp_produces_mlp_params"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.adaln_mlp_produces_mlp_params"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.adaln_parameter_triplet"
            ],
            "presentation": {
              "label": "2nd branch",
              "tone": "conditioning",
              "connection": {
                "title": "MLP-branch parameters",
                "role": "adaLN-Zero branch controls",
                "inside": "The last three chunks are shift2, scale2, and gate2; they modulate and gate the pointwise MLP branch."
              }
            }
          },
          {
            "id": "projection_ceeaf398b9e7",
            "from": "adaln_mod",
            "to": "self_attention",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.adaln_mod_enters_self_attention"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.adaln_mod_enters_self_attention"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.token_state"
            ],
            "presentation": {
              "label": "modulated x",
              "connection": {
                "title": "Modulated tokens into attention",
                "role": "attention input",
                "inside": "The shifted and scaled token stream enters full multi-head self-attention."
              }
            }
          },
          {
            "id": "projection_9fcd9ee93c62",
            "from": "add1",
            "to": "add2",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.add1_skips_to_add2"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.add1_skips_to_add2"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.token_state"
            ],
            "presentation": {
              "label": "skip x1",
              "tone": "skip",
              "connection": {
                "title": "Second residual skip",
                "role": "residual identity path",
                "inside": "The post-attention state bypasses the MLP branch and is added to the gated MLP update."
              }
            }
          },
          {
            "id": "projection_118039f7388a",
            "from": "add1",
            "to": "norm2",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.add1_enters_norm2"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.add1_enters_norm2"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.token_state"
            ],
            "presentation": {
              "label": "x1",
              "connection": {
                "title": "Post-attention state",
                "role": "second branch input",
                "inside": "The output of the first residual add becomes the input to the MLP residual branch."
              }
            }
          },
          {
            "id": "projection_f2119080ce9e",
            "from": "add2",
            "to": "token_state_out",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.add2_produces_tokens_after_blocks"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.add2_produces_tokens_after_blocks"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.token_state"
            ],
            "presentation": {
              "label": "x out",
              "connection": {
                "title": "Updated tokens",
                "role": "mutable output",
                "inside": "The block returns tokens with the same shape and ownership; at initialization both gates are zero, so the whole block starts as an identity map."
              }
            }
          },
          {
            "id": "projection_5f700ce9ba75",
            "from": "attn_params",
            "to": "adaln_mod",
            "projection": "direct",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.attn_params_enter_adaln_mod"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.attn_params_enter_adaln_mod"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.adaln_parameter_triplet"
            ],
            "presentation": {
              "label": "shift1, scale1",
              "tone": "conditioning",
              "connection": {
                "title": "First adaLN shift and scale",
                "role": "attention-branch modulation",
                "inside": "shift1 and scale1 are broadcast over tokens as (1 + scale1) * LayerNorm(x) + shift1 before self-attention."
              }
            }
          },
          {
            "id": "projection_754496e7c84f",
            "from": "attn_params",
            "to": "gate1",
            "projection": "direct",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.attn_params_enter_gate1"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.attn_params_enter_gate1"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.adaln_parameter_triplet"
            ],
            "presentation": {
              "label": "gate1",
              "tone": "conditioning",
              "connection": {
                "title": "First residual gate",
                "role": "zero-initialized branch gate",
                "inside": "gate1 is one output of the jointly zero-initialized six-vector modulation linear, so the attention branch initially contributes nothing."
              }
            }
          },
          {
            "id": "projection_d9d991675e3b",
            "from": "cond_vector",
            "to": "adaln_mlp",
            "projection": "direct",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.cond_vector_enters_adaln_mlp"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.cond_vector_enters_adaln_mlp"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.cond_vector"
            ],
            "presentation": {
              "label": "c",
              "tone": "conditioning",
              "connection": {
                "title": "Conditioning into adaLN modulation",
                "role": "modulation source",
                "inside": "The per-sample conditioning vector c passes through SiLU and one joint linear to produce six vectors; that entire linear's weights and bias are initialized to zero."
              }
            }
          },
          {
            "id": "projection_6ecb36a453ec",
            "from": "gate1",
            "to": "add1",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.gate1_enters_add1"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.gate1_enters_add1"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.token_state"
            ],
            "presentation": {
              "label": "gate1*attn",
              "connection": {
                "title": "Gated attention update",
                "role": "gated residual update",
                "inside": "The gated attention output is the update term for the first residual add."
              }
            }
          },
          {
            "id": "projection_a250746e3b7a",
            "from": "gate2",
            "to": "add2",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.gate2_enters_add2"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.gate2_enters_add2"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.token_state"
            ],
            "presentation": {
              "label": "gate2*mlp",
              "connection": {
                "title": "Gated MLP update",
                "role": "gated residual update",
                "inside": "The gated MLP output is the update term for the second residual add."
              }
            }
          },
          {
            "id": "projection_67ecbebbfe24",
            "from": "mlp_branch",
            "to": "gate2",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.mlp_branch_enters_gate2"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.mlp_branch_enters_gate2"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.token_state"
            ],
            "presentation": {
              "label": "mlp",
              "connection": {
                "title": "MLP branch output",
                "role": "residual branch value",
                "inside": "The pointwise MLP output is multiplied by gate2 before the second residual add."
              }
            }
          },
          {
            "id": "projection_72502719199a",
            "from": "mlp_params",
            "to": "gate2",
            "projection": "direct",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.mlp_params_enter_gate2"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.mlp_params_enter_gate2"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.adaln_parameter_triplet"
            ],
            "presentation": {
              "label": "gate2",
              "tone": "conditioning",
              "connection": {
                "title": "Second residual gate",
                "role": "zero-initialized branch gate",
                "inside": "gate2 is another output of the jointly zero-initialized modulation linear, so the MLP branch initially contributes nothing."
              }
            }
          },
          {
            "id": "projection_9dcf3dc3fcaf",
            "from": "mlp_params",
            "to": "scale_shift2",
            "projection": "direct",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.mlp_params_enter_scale_shift2"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.mlp_params_enter_scale_shift2"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.adaln_parameter_triplet"
            ],
            "presentation": {
              "label": "shift2, scale2",
              "tone": "conditioning",
              "connection": {
                "title": "Second adaLN shift and scale",
                "role": "MLP-branch modulation",
                "inside": "shift2 and scale2 are broadcast over tokens as (1 + scale2) * LayerNorm(x1) + shift2 before the pointwise MLP branch."
              }
            }
          },
          {
            "id": "projection_1a51f97fcb05",
            "from": "norm1",
            "to": "adaln_mod",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.norm1_enters_adaln_mod"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.norm1_enters_adaln_mod"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.token_state"
            ],
            "presentation": {
              "label": "norm1",
              "connection": {
                "title": "Normalized tokens",
                "role": "normalized branch input",
                "inside": "DiT uses LayerNorm without learned affine parameters before applying adaptive shift and scale from c."
              }
            }
          },
          {
            "id": "projection_51717eac77e8",
            "from": "norm2",
            "to": "scale_shift2",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.norm2_enters_scale_shift2"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.norm2_enters_scale_shift2"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.token_state"
            ],
            "presentation": {
              "label": "norm2",
              "connection": {
                "title": "Normalized post-attention tokens",
                "role": "normalized branch input",
                "inside": "The post-attention token state is LayerNorm-normalized before the second adaptive shift and scale."
              }
            }
          },
          {
            "id": "projection_7aa5561d6e5b",
            "from": "scale_shift2",
            "to": "mlp_branch",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.scale_shift2_enters_mlp_branch"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.scale_shift2_enters_mlp_branch"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.token_state"
            ],
            "presentation": {
              "label": "modulated x1",
              "connection": {
                "title": "Modulated tokens into MLP",
                "role": "MLP input",
                "inside": "The second shifted and scaled token stream enters the pointwise feed-forward branch."
              }
            }
          },
          {
            "id": "projection_11659f290b02",
            "from": "self_attention",
            "to": "gate1",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.self_attention_enters_gate1"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.self_attention_enters_gate1"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.token_state"
            ],
            "presentation": {
              "label": "attn",
              "connection": {
                "title": "Attention branch output",
                "role": "residual branch value",
                "inside": "The attention branch output is not added directly; it is first multiplied by gate1."
              }
            }
          },
          {
            "id": "projection_0eb3b2790bdb",
            "from": "token_state_in",
            "to": "add1",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.tokens_skip_to_add1"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.tokens_skip_to_add1"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.token_state"
            ],
            "presentation": {
              "label": "skip x",
              "tone": "skip",
              "connection": {
                "title": "First residual skip",
                "role": "residual identity path",
                "inside": "The original token state bypasses the attention branch and is added to the gated attention update."
              }
            }
          },
          {
            "id": "projection_cba01c54e090",
            "from": "token_state_in",
            "to": "norm1",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.tokens_enter_block_norm1"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.tokens_enter_block_norm1"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.token_state"
            ],
            "presentation": {
              "label": "x",
              "connection": {
                "title": "Tokens into first LayerNorm",
                "role": "branch input",
                "inside": "The incoming token state is first LayerNorm-normalized for the attention residual branch."
              }
            }
          }
        ],
        "classifications": {
          "modules.adaln_mlp": "visible",
          "modules.adaln_mod": "visible",
          "modules.add1": "visible",
          "modules.add2": "visible",
          "modules.final_layer": "excluded",
          "modules.gate1": "visible",
          "modules.gate2": "visible",
          "modules.mlp_branch": "visible",
          "modules.norm1": "visible",
          "modules.norm2": "visible",
          "modules.scale_shift2": "visible",
          "modules.self_attention": "visible",
          "value_sites.attn_params": "visible",
          "value_sites.block_input_tokens": "visible",
          "value_sites.cond_vector": "visible",
          "value_sites.mlp_params": "visible",
          "value_sites.output_tokens": "excluded",
          "value_sites.tokens_after_blocks": "visible",
          "value_sites.tokens_after_patchify": "excluded"
        },
        "projectionMode": "derived"
      }
    ]
  }
};
