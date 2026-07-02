export const manifest = {
  "architecture": {
    "id": "diffusion_transformer",
    "name": "Diffusion Transformer (DiT)",
    "status": "draft",
    "sourceYaml": "../../architectures/diffusion-transformer.yaml",
    "modules": [
      {
        "id": "patchify",
        "label": "Patchify",
        "kind": "feature_adapter",
        "role": "embed p x p latent patches into tokens and add fixed 2D sin-cos positional embeddings",
        "scale": "token",
        "inputs": [
          "input_latent"
        ],
        "outputs": [
          "token_state"
        ],
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "kind": "paper",
              "path": "arXiv:2212.09748",
              "lines": "Sec. 3.2 (Patchify)"
            },
            {
              "kind": "code",
              "path": "facebookresearch/DiT/models.py",
              "lines": "DiT.__init__ (x_embedder, pos_embed)",
              "note": "PatchEmbed plus non-learned sin-cos positional table."
            }
          ]
        }
      },
      {
        "id": "timestep_embedder",
        "label": "Timestep Embedder",
        "kind": "feature_adapter",
        "role": "encode the scalar timestep with a 256-dim sinusoidal embedding followed by a two-layer SiLU MLP",
        "scale": "sample",
        "inputs": [
          "timestep"
        ],
        "outputs": [
          "t_embedding"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "facebookresearch/DiT/models.py",
              "lines": "TimestepEmbedder"
            }
          ]
        }
      },
      {
        "id": "label_embedder",
        "label": "Label Embedder",
        "kind": "feature_adapter",
        "role": "look up the class embedding; randomly drop labels to the null class during training for classifier-free guidance",
        "scale": "sample",
        "inputs": [
          "class_label"
        ],
        "outputs": [
          "y_embedding"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "facebookresearch/DiT/models.py",
              "lines": "LabelEmbedder"
            }
          ]
        }
      },
      {
        "id": "cond_combiner",
        "label": "Conditioning Combiner",
        "kind": "feature_adapter",
        "role": "sum timestep and label embeddings into one per-sample conditioning vector",
        "scale": "sample",
        "inputs": [
          "t_embedding",
          "y_embedding"
        ],
        "outputs": [
          "cond_vector"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "facebookresearch/DiT/models.py",
              "lines": "DiT.forward",
              "note": "c = t + y."
            }
          ]
        }
      },
      {
        "id": "dit_blocks",
        "label": "DiT Block Stack",
        "kind": "attention_stack",
        "role": "update patch tokens with full self-attention and MLP branches, both modulated and gated by adaLN-Zero conditioning",
        "scale": "token",
        "repeats": 28,
        "pseudocode_ref": "../../pseudocode/diffusion-transformer.yaml",
        "depth": {
          "blocks": 28,
          "heads": 16
        },
        "contains": [
          {
            "id": "adaln_zero",
            "label": "adaLN-Zero",
            "standard_block_ref": "../../standard_blocks/adaln-zero-conditioning.yaml"
          }
        ],
        "inputs": [
          "token_state",
          "cond_vector"
        ],
        "outputs": [
          "token_state"
        ],
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
              "kind": "paper",
              "path": "arXiv:2212.09748",
              "lines": "Sec. 3.2 (DiT block design), Table 1",
              "note": "Depth 28 / 16 heads is the DiT-XL configuration; other sizes exist."
            }
          ]
        }
      },
      {
        "id": "final_layer",
        "label": "Final Layer",
        "kind": "decoder",
        "role": "apply adaLN-modulated LayerNorm, then linearly decode each token to a p x p x 2C patch prediction",
        "scale": "token",
        "inputs": [
          "token_state",
          "cond_vector"
        ],
        "outputs": [
          "output_tokens"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "facebookresearch/DiT/models.py",
              "lines": "FinalLayer"
            }
          ]
        }
      },
      {
        "id": "unpatchify",
        "label": "Unpatchify",
        "kind": "scale_transition",
        "role": "rearrange per-token patch predictions back to the spatial latent layout",
        "scale": "spatial",
        "inputs": [
          "output_tokens"
        ],
        "outputs": [
          "noise_prediction"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "facebookresearch/DiT/models.py",
              "lines": "DiT.unpatchify"
            }
          ]
        }
      }
    ],
    "representations": [
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
              "kind": "paper",
              "path": "arXiv:2212.09748",
              "lines": "Sec. 3 (Latent diffusion), Sec. 3.2"
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
              "kind": "paper",
              "path": "arXiv:2212.09748",
              "lines": "Sec. 3.2"
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
              "kind": "code",
              "path": "facebookresearch/DiT/models.py",
              "lines": "LabelEmbedder",
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
              "kind": "code",
              "path": "facebookresearch/DiT/models.py",
              "lines": "TimestepEmbedder"
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
              "kind": "code",
              "path": "facebookresearch/DiT/models.py",
              "lines": "LabelEmbedder"
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
              "kind": "code",
              "path": "facebookresearch/DiT/models.py",
              "lines": "DiT.forward",
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
              "kind": "paper",
              "path": "arXiv:2212.09748",
              "lines": "Sec. 3.2 (Patchify)"
            }
          ]
        }
      },
      {
        "id": "output_tokens",
        "scale": "token",
        "semantic_role": "decoded per-token patch predictions",
        "shape": "B x T x (p * p * 2C)",
        "carries": [
          "predicted noise patch",
          "predicted covariance patch"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "facebookresearch/DiT/models.py",
              "lines": "FinalLayer",
              "note": "Linear(hidden_size, patch_size * patch_size * out_channels)."
            }
          ]
        }
      },
      {
        "id": "noise_prediction",
        "scale": "spatial",
        "semantic_role": "predicted noise and covariance at latent resolution",
        "shape": "B x 2C x I x I, split into epsilon and Sigma",
        "carries": [
          "noise prediction",
          "covariance prediction"
        ],
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "kind": "paper",
              "path": "arXiv:2212.09748",
              "lines": "Sec. 3.2 (Transformer decoder)"
            }
          ]
        }
      }
    ],
    "execution": {
      "loops": [
        {
          "id": "denoising_loop",
          "repeats": "num_sampling_steps",
          "reruns": [
            "patchify",
            "timestep_embedder",
            "label_embedder",
            "cond_combiner",
            "dit_blocks",
            "final_layer",
            "unpatchify"
          ],
          "cached": [

          ],
          "notes": [
            "The full backbone reruns at every denoising step; only the timestep input changes across steps for a fixed sample.",
            "Classifier-free guidance runs a conditional and an unconditional pass per step, batched together in the reference sampler."
          ],
          "evidence": {
            "status": "confirmed_from_paper",
            "refs": [
              {
                "kind": "paper",
                "path": "arXiv:2212.09748",
                "lines": "Sec. 3.1, Sec. 4",
                "note": "DDPM sampling with classifier-free guidance; 250 sampling steps for reported results."
              }
            ]
          }
        }
      ]
    },
    "stateSemantics": {
      "token_state": {
        "role": "mutable_state",
        "produced_by": "patchify",
        "updated_by": [
          "dit_blocks"
        ],
        "consumed_by": [
          "final_layer"
        ],
        "notes": [
          "The token stream is the only mutable state inside one forward pass."
        ]
      },
      "cond_vector": {
        "role": "read_only_conditioning",
        "produced_by": "cond_combiner",
        "updated_by": [

        ],
        "consumed_by": [
          "dit_blocks",
          "final_layer"
        ],
        "notes": [
          "Per-sample vector; every token in a sample shares the same modulation parameters."
        ]
      }
    },
    "conditioning": [
      {
        "id": "block_adaln_zero",
        "source": "cond_vector",
        "target": "dit_blocks",
        "mode": "adaln_zero",
        "standard_block_ref": "standard_blocks/adaln-zero-conditioning.yaml",
        "updates_source": false,
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "facebookresearch/DiT/models.py",
              "lines": "DiTBlock",
              "note": "adaLN_modulation(c).chunk(6) yields shift/scale/gate for attention and MLP branches; gate projection zero-initialized."
            }
          ]
        }
      },
      {
        "id": "final_layer_adaln",
        "source": "cond_vector",
        "target": "final_layer",
        "mode": "adaln",
        "updates_source": false,
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "facebookresearch/DiT/models.py",
              "lines": "FinalLayer",
              "note": "adaLN_modulation(c).chunk(2) yields shift/scale before the linear decode; no gate in the final layer."
            }
          ]
        }
      }
    ],
    "scaleTransitions": [
      {
        "id": "patchify_tokens",
        "from_scale": "spatial",
        "to_scale": "token",
        "source": "input_latent",
        "target": "token_state",
        "projection": "patch_embedding",
        "aggregation": "flatten_patches",
        "copy_vs_pool": "pool",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "kind": "paper",
              "path": "arXiv:2212.09748",
              "lines": "Sec. 3.2 (Patchify)",
              "note": "p x p patches are linearly embedded into T = (I/p)^2 tokens."
            }
          ]
        }
      },
      {
        "id": "unpatchify_output",
        "from_scale": "token",
        "to_scale": "spatial",
        "source": "output_tokens",
        "target": "noise_prediction",
        "projection": "none",
        "aggregation": "reshape",
        "copy_vs_pool": "copy",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "kind": "paper",
              "path": "arXiv:2212.09748",
              "lines": "Sec. 3.2 (Transformer decoder)",
              "note": "Decoded tokens are rearranged back to the spatial latent layout; lossless reshape."
            }
          ]
        }
      }
    ],
    "trainingInference": {
      "objective": {
        "kind": "diffusion_noise_prediction",
        "notes": [
          "MSE on predicted noise epsilon; learned covariance Sigma trained with the full KL term, following ADM."
        ]
      },
      "schedule": {
        "kind": "linear_variance",
        "steps": 1000
      },
      "sampler": {
        "kind": "ddpm",
        "steps": 250,
        "guidance": "classifier_free"
      },
      "teacher_forcing": "not_applicable",
      "self_conditioning": "none",
      "checkpoint_notes": [
        "Operates in the latent space of a frozen, off-the-shelf VAE (8x spatial downsampling); the VAE is out of scope for this slice."
      ]
    },
    "edges": [
      {
        "from": "input_latent",
        "to": "patchify",
        "carries": [
          "noised latent"
        ],
        "operation": "patch_embedding",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "kind": "paper",
              "path": "arXiv:2212.09748",
              "lines": "Sec. 3.2 (Patchify)"
            }
          ]
        }
      },
      {
        "from": "patchify",
        "to": "token_state",
        "carries": [
          "token_state"
        ],
        "operation": "initialize_tokens_with_positional_embedding",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "facebookresearch/DiT/models.py",
              "lines": "DiT.forward"
            }
          ]
        }
      },
      {
        "from": "timestep",
        "to": "timestep_embedder",
        "carries": [
          "timestep"
        ],
        "operation": "sinusoidal_embedding",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "facebookresearch/DiT/models.py",
              "lines": "TimestepEmbedder"
            }
          ]
        }
      },
      {
        "from": "timestep_embedder",
        "to": "t_embedding",
        "carries": [
          "t_embedding"
        ],
        "operation": "mlp_projection",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "facebookresearch/DiT/models.py",
              "lines": "TimestepEmbedder"
            }
          ]
        }
      },
      {
        "from": "class_label",
        "to": "label_embedder",
        "carries": [
          "class_label"
        ],
        "operation": "label_embedding_with_cfg_dropout",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "facebookresearch/DiT/models.py",
              "lines": "LabelEmbedder"
            }
          ]
        }
      },
      {
        "from": "label_embedder",
        "to": "y_embedding",
        "carries": [
          "y_embedding"
        ],
        "operation": "embedding_lookup",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "facebookresearch/DiT/models.py",
              "lines": "LabelEmbedder"
            }
          ]
        }
      },
      {
        "from": "t_embedding",
        "to": "cond_combiner",
        "carries": [
          "t_embedding"
        ],
        "operation": "sum",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "facebookresearch/DiT/models.py",
              "lines": "DiT.forward"
            }
          ]
        }
      },
      {
        "from": "y_embedding",
        "to": "cond_combiner",
        "carries": [
          "y_embedding"
        ],
        "operation": "sum",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "facebookresearch/DiT/models.py",
              "lines": "DiT.forward"
            }
          ]
        }
      },
      {
        "from": "cond_combiner",
        "to": "cond_vector",
        "carries": [
          "cond_vector"
        ],
        "operation": "initialize_conditioning",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "facebookresearch/DiT/models.py",
              "lines": "DiT.forward"
            }
          ]
        }
      },
      {
        "from": "token_state",
        "to": "dit_blocks",
        "carries": [
          "token_state"
        ],
        "operation": "self_attention_update",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "kind": "paper",
              "path": "arXiv:2212.09748",
              "lines": "Sec. 3.2"
            }
          ]
        }
      },
      {
        "from": "cond_vector",
        "to": "dit_blocks",
        "carries": [
          "cond_vector"
        ],
        "operation": "adaln_zero_modulation",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "facebookresearch/DiT/models.py",
              "lines": "DiTBlock"
            }
          ]
        }
      },
      {
        "from": "dit_blocks",
        "to": "final_layer",
        "carries": [
          "token_state"
        ],
        "operation": "decode_tokens",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "facebookresearch/DiT/models.py",
              "lines": "DiT.forward"
            }
          ]
        }
      },
      {
        "from": "cond_vector",
        "to": "final_layer",
        "carries": [
          "cond_vector"
        ],
        "operation": "adaln_modulation",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "facebookresearch/DiT/models.py",
              "lines": "FinalLayer"
            }
          ]
        }
      },
      {
        "from": "final_layer",
        "to": "output_tokens",
        "carries": [
          "output_tokens"
        ],
        "operation": "linear_decode",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "facebookresearch/DiT/models.py",
              "lines": "FinalLayer"
            }
          ]
        }
      },
      {
        "from": "output_tokens",
        "to": "unpatchify",
        "carries": [
          "output_tokens"
        ],
        "operation": "reshape",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "facebookresearch/DiT/models.py",
              "lines": "DiT.unpatchify"
            }
          ]
        }
      },
      {
        "from": "unpatchify",
        "to": "noise_prediction",
        "carries": [
          "noise_prediction"
        ],
        "operation": "predict",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "kind": "paper",
              "path": "arXiv:2212.09748",
              "lines": "Sec. 3.2 (Transformer decoder)"
            }
          ]
        }
      }
    ],
    "claims": [
      "adaLN-Zero conditioning outperformed in-context conditioning and cross-attention conditioning in the DiT block ablations.",
      "Zero-initializing the residual gate projections makes each DiT block the identity at initialization, which accelerated training.",
      "The conditioning vector is per-sample, not per-token; all tokens of a sample share the same modulation parameters, unlike per-item AdaLN."
    ]
  },
  "standardBlocks": {
    "adaln_zero_conditioning": {
      "id": "adaln_zero_conditioning",
      "name": "AdaLN-Zero Conditioning",
      "sourceYaml": "../../standard_blocks/adaln-zero-conditioning.yaml",
      "description": "Regress per-sample shift, scale, and residual-gate parameters from a global conditioning vector; the gate projection is zero-initialized so every residual branch starts as the identity.",
      "math": [
        {
          "id": "regress_modulation",
          "text": "shift1, scale1, gate1, shift2, scale2, gate2 = MLP(SiLU(c))",
          "tex": "\\beta_1, \\gamma_1, \\alpha_1, \\beta_2, \\gamma_2, \\alpha_2 = \\operatorname{MLP}(\\operatorname{SiLU}(c))",
          "operation": "conditioning_projection"
        },
        {
          "id": "modulate_attention_branch",
          "text": "h = x + gate1 * Attn(scale1 * LN(x) + shift1)",
          "tex": "h = x + \\alpha_1 \\odot \\operatorname{Attn}(\\gamma_1 \\odot \\operatorname{LN}(x) + \\beta_1)",
          "operation": "gated_residual_attention"
        },
        {
          "id": "modulate_mlp_branch",
          "text": "y = h + gate2 * MLP(scale2 * LN(h) + shift2)",
          "tex": "y = h + \\alpha_2 \\odot \\operatorname{MLP}(\\gamma_2 \\odot \\operatorname{LN}(h) + \\beta_2)",
          "operation": "gated_residual_mlp"
        },
        {
          "id": "identity_initialization",
          "text": "gate projection weights initialized to zero, so each block is the identity at initialization",
          "operation": "initialization_policy"
        }
      ]
    },
    "per_item_adaln_conditioning": {
      "id": "per_item_adaln_conditioning",
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
      "sourceYaml": "../../pseudocode/diffusion-transformer.yaml",
      "symbols": [
        {
          "id": "input_latent",
          "name": "z",
          "architectureRef": "representations.input_latent"
        },
        {
          "id": "timestep",
          "name": "t",
          "architectureRef": "representations.timestep"
        },
        {
          "id": "class_label",
          "name": "y",
          "architectureRef": "representations.class_label"
        },
        {
          "id": "t_embedding",
          "name": "t_emb",
          "architectureRef": "representations.t_embedding"
        },
        {
          "id": "y_embedding",
          "name": "y_emb",
          "architectureRef": "representations.y_embedding"
        },
        {
          "id": "cond_vector",
          "name": "c",
          "architectureRef": "representations.cond_vector"
        },
        {
          "id": "token_state",
          "name": "x",
          "architectureRef": "representations.token_state"
        },
        {
          "id": "output_tokens",
          "name": "u",
          "architectureRef": "representations.output_tokens"
        },
        {
          "id": "noise_prediction",
          "name": "ε, Σ",
          "architectureRef": "representations.noise_prediction"
        }
      ],
      "lines": [
        {
          "id": "patchify_tokens",
          "text": "x = PatchEmbed(z) + pos_embed  # fixed 2D sin-cos",
          "refs": "DiT.forward",
          "architectureRefs": [
            "modules.patchify"
          ]
        },
        {
          "id": "embed_timestep",
          "text": "t_emb = MLP(SinCosEmbed_256(t))",
          "refs": "TimestepEmbedder",
          "architectureRefs": [
            "modules.timestep_embedder"
          ]
        },
        {
          "id": "embed_label",
          "text": "y_emb = Embedding(drop_to_null(y))  # label dropout for CFG",
          "refs": "LabelEmbedder",
          "architectureRefs": [
            "modules.label_embedder"
          ]
        },
        {
          "id": "combine_conditioning",
          "text": "c = t_emb + y_emb",
          "refs": "DiT.forward",
          "architectureRefs": [
            "modules.cond_combiner",
            "claims.conditioning_is_per_sample"
          ]
        },
        {
          "id": "run_blocks",
          "text": "for block in blocks: x = DiTBlock(x, c)  # adaLN-Zero, N blocks",
          "refs": "DiTBlock",
          "architectureRefs": [
            "modules.dit_blocks",
            "claims.adaln_zero_beats_alternatives"
          ],
          "standardBlockRef": "../../standard_blocks/adaln-zero-conditioning.yaml"
        },
        {
          "id": "decode_tokens",
          "text": "u = Linear(modulate(LayerNorm(x), MLP(c)))",
          "refs": "FinalLayer",
          "architectureRefs": [
            "modules.final_layer"
          ]
        },
        {
          "id": "unpatchify_output",
          "text": "eps, sigma = split(Unpatchify(u))",
          "refs": "DiT.unpatchify",
          "architectureRefs": [
            "modules.unpatchify"
          ]
        }
      ]
    }
  },
  "boards": {
    "sourceYaml": "../../views/dit-semantic-zoom.view.yaml",
    "rootBoard": "dit_overview",
    "items": [
      {
        "id": "dit_overview",
        "title": "Diffusion Transformer (DiT)",
        "summary": "A one-block overview. Open the backbone to see patch featurization, conditioning embedders, the adaLN-Zero block stack, and the token decoder. Featurization stages are elided into edges; hover an edge port to peek at them, click to pin.",
        "scale_lanes": false,
        "grid": {
          "columns": 3,
          "rows": 3
        },
        "nodes": [
          {
            "id": "dit_pipeline",
            "kind": "module",
            "label": "DiT denoising backbone",
            "scale": "abstract",
            "role": "class- and timestep-conditioned denoising over VAE latent patches",
            "detail": "patchify -> N x DiT blocks (adaLN-Zero) -> linear decode",
            "col": 2,
            "row": 2,
            "expandable": true
          }
        ]
      },
      {
        "id": "dit_pipeline",
        "title": "DiT Denoising Backbone",
        "summary": "The backbone patchifies the noised latent into tokens, builds one per-sample conditioning vector from timestep and class label, refines tokens with adaLN-Zero blocks, and decodes back to noise and covariance. Featurization modules are elided; their edges carry them.",
        "parent": "dit_overview",
        "scale_lanes": false,
        "grid": {
          "columns": 7,
          "rows": 5
        },
        "nodes": [
          {
            "id": "timestep",
            "kind": "representation",
            "rep_ref": "timestep",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "col": 1,
            "row": 1
          },
          {
            "id": "class_label",
            "kind": "representation",
            "rep_ref": "class_label",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "col": 1,
            "row": 2
          },
          {
            "id": "input_latent",
            "kind": "representation",
            "rep_ref": "input_latent",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "col": 1,
            "row": 4
          },
          {
            "id": "timestep_embedder",
            "kind": "module",
            "module_ref": "timestep_embedder",
            "treatment": "compact",
            "density": "compact",
            "col": 2,
            "row": 1,
            "elide": true
          },
          {
            "id": "label_embedder",
            "kind": "module",
            "module_ref": "label_embedder",
            "treatment": "compact",
            "density": "compact",
            "col": 2,
            "row": 2,
            "elide": true
          },
          {
            "id": "t_embedding",
            "kind": "representation",
            "rep_ref": "t_embedding",
            "treatment": "compact",
            "density": "compact",
            "col": 3,
            "row": 1,
            "elide": true
          },
          {
            "id": "y_embedding",
            "kind": "representation",
            "rep_ref": "y_embedding",
            "treatment": "compact",
            "density": "compact",
            "col": 3,
            "row": 2,
            "elide": true
          },
          {
            "id": "cond_combiner",
            "kind": "module",
            "module_ref": "cond_combiner",
            "treatment": "compact",
            "density": "compact",
            "col": 4,
            "row": 2,
            "elide": true
          },
          {
            "id": "patchify",
            "kind": "module",
            "module_ref": "patchify",
            "treatment": "compact",
            "density": "compact",
            "col": 2,
            "row": 4,
            "elide": true
          },
          {
            "id": "cond_vector",
            "kind": "representation",
            "rep_ref": "cond_vector",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 4,
            "row": 1
          },
          {
            "id": "token_state",
            "kind": "representation",
            "rep_ref": "token_state",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 3,
            "row": 4
          },
          {
            "id": "dit_blocks",
            "kind": "module",
            "module_ref": "dit_blocks",
            "prominence": "primary",
            "treatment": "block",
            "col": 5,
            "row": 3,
            "expandable": true
          },
          {
            "id": "final_layer",
            "kind": "module",
            "module_ref": "final_layer",
            "prominence": "primary",
            "treatment": "compact",
            "density": "compact",
            "col": 6,
            "row": 3
          },
          {
            "id": "output_tokens",
            "kind": "representation",
            "rep_ref": "output_tokens",
            "treatment": "compact",
            "density": "compact",
            "col": 6,
            "row": 4,
            "elide": true
          },
          {
            "id": "unpatchify",
            "kind": "module",
            "module_ref": "unpatchify",
            "treatment": "compact",
            "density": "compact",
            "col": 7,
            "row": 4,
            "elide": true
          },
          {
            "id": "noise_prediction",
            "kind": "representation",
            "rep_ref": "noise_prediction",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "col": 7,
            "row": 3
          }
        ],
        "edges": [
          {
            "from": "timestep",
            "to": "timestep_embedder",
            "label": "t",
            "connection": {
              "title": "Timestep into embedder",
              "role": "noise-level featurization",
              "inside": "The scalar timestep is expanded with a 256-dim sinusoidal embedding and projected by a two-layer SiLU MLP."
            }
          },
          {
            "from": "timestep_embedder",
            "to": "t_embedding",
            "label": "t emb",
            "connection": {
              "title": "Embedded timestep",
              "role": "sample-scale embedding",
              "inside": "The MLP output is a per-sample vector at model width d."
            }
          },
          {
            "from": "class_label",
            "to": "label_embedder",
            "label": "y",
            "connection": {
              "title": "Label into embedder",
              "role": "class featurization",
              "inside": "The class index is looked up in an embedding table; during training labels randomly drop to a null class for classifier-free guidance."
            }
          },
          {
            "from": "label_embedder",
            "to": "y_embedding",
            "label": "y emb",
            "connection": {
              "title": "Embedded label",
              "role": "sample-scale embedding",
              "inside": "The lookup output is a per-sample vector at model width d."
            }
          },
          {
            "from": "t_embedding",
            "to": "cond_combiner",
            "label": "add",
            "connection": {
              "title": "Timestep embedding into combiner",
              "role": "additive combination",
              "inside": "Timestep and label embeddings are summed elementwise; no gating or concatenation."
            }
          },
          {
            "from": "y_embedding",
            "to": "cond_combiner",
            "label": "add",
            "connection": {
              "title": "Label embedding into combiner",
              "role": "additive combination",
              "inside": "Timestep and label embeddings are summed elementwise; no gating or concatenation."
            }
          },
          {
            "from": "cond_combiner",
            "to": "cond_vector",
            "label": "c",
            "tone": "conditioning",
            "connection": {
              "title": "Conditioning vector",
              "role": "read-only conditioning source",
              "inside": "The summed vector c = t_emb + y_emb is per-sample and is never updated by the block stack."
            }
          },
          {
            "from": "input_latent",
            "to": "patchify",
            "label": "latent",
            "connection": {
              "title": "Noised latent into patchify",
              "role": "patch featurization",
              "inside": "The spatial latent is cut into p x p patches, each linearly embedded into one token."
            }
          },
          {
            "from": "patchify",
            "to": "token_state",
            "label": "tokens + pos",
            "connection": {
              "title": "Token initialization",
              "role": "mutable token stream",
              "inside": "Patch tokens receive fixed 2D sin-cos positional embeddings; this is the only mutable state in the forward pass."
            }
          },
          {
            "from": "cond_vector",
            "to": "dit_blocks",
            "label": "c",
            "tone": "conditioning",
            "connection": {
              "title": "adaLN-Zero conditioning",
              "role": "per-sample modulation of every block",
              "inside": "Each block regresses shift, scale, and zero-initialized residual gates from c and applies them to its attention and MLP branches."
            }
          },
          {
            "from": "token_state",
            "to": "dit_blocks",
            "label": "x",
            "connection": {
              "title": "Tokens into the block stack",
              "role": "coarse mutable state",
              "inside": "Full self-attention over all patch tokens updates the token stream block by block."
            }
          },
          {
            "from": "dit_blocks",
            "to": "final_layer",
            "label": "refined tokens",
            "connection": {
              "title": "Refined tokens to decoder",
              "role": "token decoding",
              "inside": "The final layer normalizes tokens with adaLN-modulated LayerNorm before the linear decode."
            }
          },
          {
            "from": "cond_vector",
            "to": "final_layer",
            "label": "c",
            "tone": "conditioning",
            "connection": {
              "title": "Final-layer adaLN",
              "role": "shift/scale modulation",
              "inside": "The final layer regresses shift and scale (no gate) from c before decoding."
            }
          },
          {
            "from": "final_layer",
            "to": "output_tokens",
            "label": "p*p*2C per token",
            "connection": {
              "title": "Linear decode",
              "role": "per-token patch prediction",
              "inside": "Each token is decoded to a p x p patch of predicted noise and covariance channels."
            }
          },
          {
            "from": "output_tokens",
            "to": "unpatchify",
            "label": "reshape",
            "connection": {
              "title": "Tokens into unpatchify",
              "role": "layout restoration",
              "inside": "Per-token patch predictions are rearranged back to the spatial latent grid; this is a lossless reshape."
            }
          },
          {
            "from": "unpatchify",
            "to": "noise_prediction",
            "label": "eps, sigma",
            "connection": {
              "title": "Noise and covariance prediction",
              "role": "final outputs",
              "inside": "The output splits channelwise into the predicted noise epsilon and covariance Sigma."
            }
          }
        ],
        "open_notes": [
          "Featurization (patchify, embedders, combiner) and output reshaping are elided; the contracted edges carry them."
        ]
      },
      {
        "id": "dit_blocks",
        "title": "DiT Block (adaLN-Zero)",
        "summary": "One block of the stack. A per-sample MLP on c regresses six modulation vectors; attention and MLP branches are shifted, scaled, and residual-gated, with gates zero-initialized so the block starts as the identity.",
        "parent": "dit_pipeline",
        "scale_lanes": false,
        "grid": {
          "columns": 5,
          "rows": 3
        },
        "nodes": [
          {
            "id": "token_state_in",
            "kind": "representation",
            "rep_ref": "token_state",
            "label": "tokens in",
            "col": 1,
            "row": 2
          },
          {
            "id": "cond_vector",
            "kind": "representation",
            "rep_ref": "cond_vector",
            "col": 2,
            "row": 1
          },
          {
            "id": "adaln_mod",
            "kind": "operation",
            "label": "adaLN-Zero modulation",
            "scale": "sample",
            "role": "regress shift1, scale1, gate1, shift2, scale2, gate2 from SiLU(c); gate projection zero-initialized",
            "col": 2,
            "row": 2
          },
          {
            "id": "self_attention",
            "kind": "module",
            "module_ref": "dit_blocks",
            "label": "multi-head self-attention",
            "col": 3,
            "row": 2
          },
          {
            "id": "mlp_branch",
            "kind": "operation",
            "label": "pointwise MLP branch",
            "scale": "token",
            "role": "second modulated, gated residual branch after attention",
            "col": 4,
            "row": 2
          },
          {
            "id": "token_state_out",
            "kind": "representation",
            "rep_ref": "token_state",
            "label": "tokens out",
            "col": 5,
            "row": 2
          }
        ],
        "edges": [
          {
            "from": "token_state_in",
            "to": "adaln_mod",
            "label": "LN(x)",
            "connection": {
              "title": "Normalize tokens",
              "role": "branch input",
              "inside": "Tokens are LayerNorm-normalized (no learned affine) before receiving shift and scale from the conditioning MLP."
            }
          },
          {
            "from": "cond_vector",
            "to": "adaln_mod",
            "label": "SiLU + MLP",
            "tone": "conditioning",
            "connection": {
              "title": "Per-sample modulation parameters",
              "role": "adaptive conditioning",
              "inside": "One MLP on c produces all six modulation vectors, shared by every token of the sample."
            }
          },
          {
            "from": "adaln_mod",
            "to": "self_attention",
            "label": "scale1*x + shift1",
            "connection": {
              "title": "Modulated tokens into attention",
              "role": "attention input",
              "inside": "The modulated stream enters full self-attention; the branch output is multiplied by the zero-initialized gate1 before the residual add."
            }
          },
          {
            "from": "self_attention",
            "to": "mlp_branch",
            "label": "x + gate1*attn",
            "connection": {
              "title": "Gated attention residual",
              "role": "intermediate token state",
              "inside": "The MLP branch repeats the pattern with shift2, scale2, and gate2 on the post-attention state."
            }
          },
          {
            "from": "mlp_branch",
            "to": "token_state_out",
            "label": "x + gate2*mlp",
            "connection": {
              "title": "Updated tokens",
              "role": "mutable output",
              "inside": "The block returns tokens with the same shape and ownership; at initialization both gates are zero, so the block is the identity."
            }
          }
        ]
      }
    ]
  }
};
